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

    const systemInstruction = `You are Finora AI, a personal finance assistant embedded in the Finora app. \
You have access to the user's real financial data provided below. \
Use it to give specific, grounded, and actionable insights. \
Always reference actual figures from the data. \
If the data is insufficient to answer (e.g. fewer than a week of transactions), say so clearly and explain what you can determine.

User Financial Data (JSON):
${context}

Today's date: ${today}

Guidelines:
- Be concise, friendly, and conversational — no unnecessary preamble.
- Always use the user's currency (found in the data) when quoting amounts.
- Reference specific category names, amounts, and date ranges from the data.
- Highlight over-budget categories, stalled goals, or notable spending trends when relevant.
- Do not invent figures not present in the data.`

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
