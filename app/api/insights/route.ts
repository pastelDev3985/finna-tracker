import { NextResponse } from "next/server"
import { z } from "zod"
import { GoogleGenAI } from "@google/genai"
import { auth } from "@/lib/auth"
import { buildInsightsContext } from "@/lib/services/insights"

// ─── Request schema ────────────────────────────────────────────────────────────

const HistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
})

const RequestSchema = z.object({
  message: z.string().min(1, { error: "Message is required" }),
  history: z.array(HistoryMessageSchema).default([]),
})

// ─── POST /api/insights ────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  // ── Parse request body ──────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors[0] ?? "Invalid request" },
      { status: 400 }
    )
  }

  const { message, history } = parsed.data

  try {
    // ── Build financial context ────────────────────────────────────────────────
    const context = await buildInsightsContext(userId)

    const today = new Date().toISOString().slice(0, 10)

    const systemInstruction = `You are Finora AI, a personal finance assistant inside the Finora app. \
You only help with money and budgeting topics using the user's Finora data below plus general personal-finance concepts that clearly tie back to that data.

User Financial Data (JSON):
${context}

Today's date: ${today}

Scope — stay on topic:
- Answer questions about spending, income, budgets, savings goals, trends, categories, and how to improve habits based on the numbers provided.
- You may briefly explain a personal-finance term if it helps interpret their data (e.g. what "over budget" means in their context).
- If the user asks about anything not related to personal finance or their Finora data (e.g. coding, homework, general knowledge, politics, entertainment, unrelated small talk, or other apps), do not fulfil the request. Reply in one or two short sentences that you only help with money questions in Finora, and suggest one concrete finance question they could ask instead (using their data). Never answer the off-topic part.

Safety and accuracy:
- You are not a licensed financial, tax, or legal adviser. Do not give personalised investment, tax, or legal instructions; you may share educational, high-level points and suggest speaking to a qualified professional when the user needs binding advice.
- Do not invent amounts, accounts, or transactions not present in the JSON. If data is missing or insufficient, say what is missing and what you can still infer.
- Do not claim to browse the web, access other systems, or see data outside this context.

Tone and style:
- Be concise, friendly, and conversational — no unnecessary preamble.
- Use the user's currency from the data when quoting amounts.
- Reference specific category names, amounts, and date ranges from the data when relevant.
- Highlight over-budget categories, stalled goals, or notable spending trends when useful.`

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    // Map history roles: "assistant" → "model" (Gemini convention)
    const contents = [
      ...history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ]

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
      },
    })

    // ── Stream SSE response back to client ─────────────────────────────────────
    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text
            if (text) {
              // Each SSE event carries a JSON-encoded text chunk
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(text)}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (streamErr) {
          console.error("[insights/stream]", streamErr)
          controller.error(streamErr)
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (error) {
    console.error("[insights/POST]", error)
    return NextResponse.json(
      { error: "Failed to generate insights. Please try again." },
      { status: 500 }
    )
  }
}
