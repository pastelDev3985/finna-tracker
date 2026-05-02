# AI Insights — scope and guardrails

This document is the reference for what **Finora AI** (Insights chat) is allowed to do, how it refuses off-topic use, and where those rules are enforced.

## Where behaviour is defined

- **Primary enforcement:** `app/api/insights/route.ts` — the `systemInstruction` string sent to Gemini with every request. Copy there is the product contract; keep it in sync with this guide when you change scope.

## Intended scope (in-bounds)

- Questions about the signed-in user’s **Finora data**: transactions (patterns, categories, totals), budgets, goals, currency display, and month-to-month trends **when supported by the JSON context** built in `lib/services/insights.ts`.
- Short **definitions** of personal-finance concepts **only when tied to interpreting that data** (e.g. “what does X% of budget used mean for Food?”).

## Out of scope (model must refuse)

- General knowledge, coding, homework, politics, entertainment, unrelated chat, or any topic **not** reasonably tied to personal money management in Finora.
- Requests that assume access to **other apps, the open web, or real-time data** not in the context payload.
- **Personalised** investment picks, tax filings, or legal steps — the model should stay educational and defer to qualified professionals where appropriate.

## Expected refusal pattern

For off-topic messages, the model should **not** answer the unrelated request. It should:

1. State briefly that it only helps with money questions inside Finora.
2. Offer **one** example of a useful in-app question (ideally grounded in the kinds of data we send: categories, budgets, goals).

## User-facing copy

The Insights page includes a short notice that the assistant is **finance-only**. Update that copy if you change the product promise.

## Operational notes

- Guardrails are **prompt-based**, not a separate classifier. Strong system instructions reduce misuse; they do not guarantee zero off-topic answers. Monitor and tighten wording if needed.
- The client sends only `message` and `history`; all grounding data is assembled server-side — see `buildInsightsContext` and `copilot-instructions.md` for serialization and data-shape rules.
