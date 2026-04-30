# Finora — Backend Developer Checklist

> **Scope:** Everything that runs on the server — database schema, Prisma ORM, Auth.js, service layer, API routes, server actions, security, and environment configuration.
>
> Work through phases **in order**. Do not start Phase N+1 until all exit criteria for Phase N are met.
> Mark tasks `[x]` as they are completed.

---

## Non-Negotiable Rules (Read Before Touching Anything)

- [x] Every Prisma query on user-owned data **must** include `where: { userId }`. A missing scope is a data-leak security bug.
- [x] All monetary DB fields use `Decimal @db.Decimal(14,2)`. **Never `Float`.**
- [x] `GEMINI_API_KEY` lives server-side only. Never reference it in any client-facing file.
- [x] Always import the Prisma client from `lib/db.ts`. Never call `new PrismaClient()` elsewhere.
- [x] All errors are caught at the service layer and returned as `{ error: string }`. Never let Prisma errors surface to the client.
- [x] Use `cuid()` for all model IDs — never `uuid()`, never auto-increment.
- [x] Passwords are bcrypt-hashed before storage. Never log or return plain-text passwords.

---

## Phase 0 — Foundation & Infrastructure ✅

### 0.1 Project scaffold
- [x] Next.js 16.2.4 app created with App Router and TypeScript
- [x] `strict: true` enabled in `tsconfig.json`
- [x] ESLint configured and passing

### 0.2 Runtime dependencies installed
- [x] `@prisma/client` (v7.8.0) + `@prisma/adapter-neon` + `@neondatabase/serverless` (Prisma 7 requires driver adapter)
- [x] `zod` (v4.3.6)
- [x] `next-auth` (v5 beta)
- [x] `bcryptjs` + `@types/bcryptjs`
- [x] `@google/genai` — Google Generative AI SDK (replaces `@anthropic-ai/sdk`)
- [x] `@getbrevo/brevo` — Brevo v5 SDK for transactional email
- [x] `sonner`

### 0.3 Dev dependencies installed
- [x] `prisma` (dev, v7.8.0)

### 0.4 Environment variables
- [x] `.env` created with:
  - [x] `DATABASE_URL` — Neon pooled connection string (used by runtime adapter)
  - [x] `DIRECT_URL` — Neon direct connection string (used by `prisma.config.ts` for migrations)
  - [x] `NEXTAUTH_SECRET`
  - [x] `NEXTAUTH_URL` — `http://localhost:3000`
  - [x] `GEMINI_API_KEY` — Google AI Studio API key (replaces `ANTHROPIC_API_KEY`)
  - [x] `BREVO_API_KEY` — Brevo transactional email API key
  - [x] `BREVO_SENDER_EMAIL` — verified sender address in Brevo dashboard
  - [x] `BREVO_SENDER_NAME` — display name for outgoing emails (default: "Finora")

### 0.5 Prisma initialised
- [x] `prisma/schema.prisma` — datasource has `provider` only (Prisma 7: URLs move to `prisma.config.ts`)
- [x] `lib/db.ts` — singleton using `PrismaNeon` adapter with `DATABASE_URL`
- [x] `prisma.config.ts` — `DIRECT_URL` used for migrations

> **Prisma 7 note:** `url`/`directUrl` in `schema.prisma` are removed in v7. URLs live in `prisma.config.ts` (CLI/migrations) and the adapter constructor (runtime).

### 0.6 Exit criteria
- [x] `npx prisma validate` passes
- [x] `npm run build` passes on clean scaffold

---

## Phase 1 — Database Schema & Migrations ✅

### 1.1 Enums (define before models)
- [x] `TransactionType` — `INCOME | EXPENSE`
- [x] `GoalStatus` — `ACTIVE | COMPLETED | PAUSED`
- [x] `RecurrenceFrequency` — `NONE | DAILY | WEEKLY | MONTHLY | YEARLY`

### 1.2 Models — exact field types

**User** ✅ **Category** ✅ **Transaction** ✅ **Budget** ✅ **Goal** ✅ **GoalContribution** ✅

All models implemented with correct field types, `Decimal @db.Decimal(14,2)` on monetary fields, `cuid()` IDs, all relations with correct `onDelete: Cascade`, and all indexes.

### 1.3 Migration & generation
- [x] Initial migration applied: `20260429202602_init`
- [x] Prisma client generated to `lib/generated/prisma/`

### 1.4 Auth setup
- [x] `lib/auth.ts` — Auth.js v5 `Credentials` provider with bcrypt verify, JWT + session callbacks
- [x] `app/api/auth/[...nextauth]/route.ts` — route handler exporting `{ GET, POST }`
- [x] `types/next-auth.d.ts` — `Session.user` extended with `id` + `currency`; `JWT` extended to match
- [x] `proxy.ts` — Next.js 16 route guard (protects all app routes, redirects auth routes for logged-in users)
- [x] `app/api/auth/register/route.ts` — POST handler: Zod v4 validation, bcrypt hash (rounds 12), 409 on duplicate email
- [x] `types/index.ts` — all shared TypeScript types (`ServiceResult<T>`, `TransactionData`, `BudgetWithSpend`, etc.)

### 1.5 Exit criteria
- [x] `npx prisma validate` passes
- [x] `npm run build` passes cleanly

---

## Phase 2 — Authentication ✅

Covered in Phase 1 above (auth was built alongside schema). All items complete — see Phase 1.4.

---

## Phase 3 — Category Service ✅

### 3.1 Zod schemas
- [x] `CreateCategorySchema` — `{ name, type, icon?, color? }`
- [x] `UpdateCategorySchema` — partial of above

### 3.2 Service functions (all scoped to `userId`)
- [x] `listCategories(userId, type?)` — ordered by type then name
- [x] `createCategory(userId, data)` — P2002 (duplicate name) handled gracefully
- [x] `updateCategory(userId, id, data)` — ownership enforced via `where: { id, userId }`
- [x] `deleteCategory(userId, id)` — counts linked transactions first; returns clear error if any exist

### 3.3 Default category seeding
- [x] `seedDefaultCategories(userId)` exported from `lib/services/categories.ts`
  - Income: Salary, Freelance, Business, Investment, Other Income
  - Expense: Food & Drink, Transport, Housing, Utilities, Healthcare, Shopping, Entertainment, Education, Savings Transfer, Other

### 3.4 Exit criteria
- [x] All queries scoped to `userId`
- [x] Delete with linked transactions → `{ error: "Cannot delete — N transactions linked" }`

---

## Phase 4 — Transaction Service ✅

### 4.1 Zod schemas
- [x] `CreateTransactionSchema` — `{ categoryId, type, amount (positive string), date, note?, recurrence? }`
- [x] `UpdateTransactionSchema` — partial of above
- [x] `TransactionFiltersSchema` — `{ startDate?, endDate?, type?, categoryId?, page?, limit? }`

### 4.2 Service functions (all scoped to `userId`)
- [x] `listTransactions(userId, filters)` — paginated 25/page, `PaginatedResult<TransactionData>` returned
- [x] `getTransactionById(userId, id)` — ownership via `where: { id, userId }`
- [x] `createTransaction(userId, data)` — amount stored as `new Decimal(parsed.data.amount)`
- [x] `updateTransaction(userId, id, data)` — ownership enforced
- [x] `deleteTransaction(userId, id)` — P2025 handled gracefully

### 4.3 Summary query
- [x] `getTransactionSummary(userId, month, year)` — Decimal arithmetic throughout; never JS `number` for sums

### 4.4 Currency utility (`lib/currency.ts`)
- [x] `formatCurrency(amount, currency)` — `Intl.NumberFormat`, fallback to manual symbol
- [x] `getCurrencySymbol(currency)` — quick symbol lookup
- [x] `SUPPORTED_CURRENCIES` — 30 currencies covering GHS, USD, GBP, EUR, NGN + major African & global currencies

### 4.5 Exit criteria
- [x] Negative amounts rejected by Zod schema
- [x] Pagination total + page count correct
- [x] All monetary arithmetic uses `Decimal`

---

## Phase 5 — Budget Service ✅

### 5.1 Zod schemas
- [x] `UpsertBudgetSchema` — `{ categoryId, limitAmount (positive string), month (1–12), year }`

### 5.2 Service functions (all scoped to `userId`)
- [x] `listBudgets(userId, month, year)` — real spend computed per category, `BudgetWithSpend[]` returned
- [x] `getBudgetWithSpend(userId, categoryId, month, year)` — single category; returns `null` if no budget set
- [x] `upsertBudget(userId, data)` — Prisma `upsert` on `@@unique` constraint; never duplicates
- [x] `deleteBudget(userId, id)` — ownership enforced

### 5.3 Exit criteria
- [x] `spentAmount`, `percentUsed`, `isOverBudget` all computed via `Decimal` arithmetic
- [x] No budget for a category → `getBudgetWithSpend` returns `{ data: null }` not an error

---

## Phase 6 — Goals Service ✅

### 6.1 Zod schemas
- [x] `CreateGoalSchema` — `{ name, targetAmount (positive string), deadline? (coerced Date), icon? }`
- [x] `UpdateGoalSchema` — partial of above + `status?`
- [x] `AddContributionSchema` — `{ amount (positive string), note?, date }`

### 6.2 Service functions (all scoped to `userId`)
- [x] `listGoals(userId)` — newest first
- [x] `getGoalById(userId, id)` — includes `contributions` ordered by date desc
- [x] `createGoal(userId, data)` — Zod validated, Decimal amount
- [x] `updateGoal(userId, id, data)` — ownership enforced; P2025 handled
- [x] `deleteGoal(userId, id)` — contributions cascade via DB `onDelete: Cascade`
- [x] `addContribution(userId, goalId, data)` — atomic `prisma.$transaction`: insert contribution + update `savedAmount`; auto-sets `status = COMPLETED` when target reached

### 6.3 Exit criteria
- [x] `savedAmount` updated atomically with contribution insert
- [x] Auto-complete fires when `savedAmount >= targetAmount`
- [x] Cross-user contribution attempt → `{ error: "Goal not found" }`

---

## Phase 7 — Dashboard Service ✅

### 7.1 Service functions (all scoped to `userId`)
- [x] `getDashboardSummary(userId)` — current month income, expenses, net
- [x] `getBudgetHealthStrip(userId)` — all budgets for current month with real `spentAmount` + `percentUsed`
- [x] `getTopGoals(userId, limit = 3)` — top 3 `ACTIVE` goals by `savedAmount`
- [x] `getRecentTransactions(userId, limit = 8)` — last N by date desc, category included

### 7.2 Exit criteria
- [x] `getTopGoals` only returns `status: ACTIVE` goals
- [x] All queries scoped to `userId`
- [x] `npm run build` passes cleanly with no TS errors

---

## Phase 8 — Reports Service ✅

### 8.1 Service functions (all scoped to `userId`)
- [x] `getMonthlySpendByCategory(userId, month, year)` — `CategorySpend[]` sorted by total desc
- [x] `getIncomeVsExpensesTrend(userId, months = 6)` — rolling N-month `MonthlyTrend[]`
- [x] `getDailySpend(userId, month, year)` — `DailySpend[]` keyed by `"YYYY-MM-DD"` for heatmap
- [x] `getCategoryBreakdown(userId, month, year)` — `CategoryBreakdown[]` with `percentage` for donut chart

### 8.2 Exit criteria
- [x] All arithmetic uses `Decimal` — no raw JS `number` for monetary sums
- [x] Empty month → empty array (not an error)
- [x] `npm run build` passes cleanly

---

## Phase 9 — AI Insights API Route ✅

### 9.1 Context builder (`lib/services/insights.ts`)
- [x] `buildInsightsContext(userId)` — aggregates and returns a compact JSON string:
  - [x] Last 3 months of transactions **grouped by category + week** (totals only — not raw rows)
  - [x] Current month budget statuses: `{ category, limitAmount, spentAmount, percentUsed, isOverBudget }`
  - [x] All `ACTIVE` goals: `{ name, targetAmount, savedAmount, percentProgress, deadline }`
  - [x] User: `{ name, currency }`

### 9.2 API route (`app/api/insights/route.ts`)
- [x] POST handler only
- [x] Auth check at the top — return `401` if no valid session
- [x] Receives `{ message: string, history: { role: "user" | "assistant", content: string }[] }`
- [x] Calls `buildInsightsContext(userId)` server-side
- [x] Builds Gemini `contents` array: history mapped to `{ role: "user" | "model", parts: [{ text }] }[]` + current message appended
- [x] System prompt injected via `config.systemInstruction` (Gemini SDK convention)
- [x] Streams response using `@google/genai` `generateContentStream()` with `gemini-2.5-flash`
- [x] Returns a `ReadableStream` response (`text/event-stream`); each event: `data: <JSON-encoded text chunk>\n\n`; terminated with `data: [DONE]\n\n`
- [x] `GEMINI_API_KEY` is never referenced in any client-facing file

> **SDK note:** Uses `@google/genai` (the unified Google GenAI SDK). History role mapping: incoming `"assistant"` → Gemini `"model"`. Model ID: `gemini-2.5-flash` (stable).

### 9.3 Exit criteria
- [x] Unauthenticated POST → `401`
- [x] Response streams progressively (verify in network tab)
- [x] `npm run build` passes cleanly — `GEMINI_API_KEY` does not appear in client bundle
- [x] AI response is grounded: if context is insufficient, it says so clearly

---

## Phase 10 — Settings & User Management ✅

### 10.1 Profile service + action
- [x] `updateProfile(userId, { name, email })` — validates uniqueness on email change
- [x] `changePassword(userId, { currentPassword, newPassword })` — bcrypt verify then hash new password
- [x] `updateProfileAction`, `changePasswordAction` in `lib/actions/settings.ts`

### 10.2 Currency service + action
- [x] `updateCurrency(userId, currency)` — validates currency code is in `SUPPORTED_CURRENCIES` list, updates `User.currency`
- [x] `updateCurrencyAction` revalidates all data-heavy pages on change

### 10.3 Account deletion
- [x] `deleteAccount(userId, password)` — bcrypt verify password → `prisma.user.delete` (cascades all related data via schema `onDelete: Cascade`)
- [x] `deleteAccountAction` in `lib/actions/settings.ts`

### 10.4 Exit criteria
- [x] Email change fails cleanly if the new email is already in use
- [x] Password change requires correct current password
- [x] Account deletion with wrong password returns error; correct password deletes everything
- [x] Cascade verified: after account delete, no orphaned `Transaction`, `Budget`, `Goal`, `Category`, or `GoalContribution` rows remain

---

## Phase 10.5 — Transactional Email (Brevo) ✅

> **SDK:** `@getbrevo/brevo` v5 (`BrevoClient`). All email is server-side only. `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME` are never exposed to the client.
>
> ⚠️ **Action required:** Verify `BREVO_SENDER_EMAIL` in your Brevo dashboard under Senders & Domains before any email will deliver.

### 10.5.1 Email service (`lib/email.ts`)
- [x] `BrevoClient` singleton (dev-mode global to prevent hot-reload duplication)
- [x] `sendEmailVerificationOtp(to, otp)` — styled 6-digit OTP email, expires in 15 min
- [x] `sendWelcomeEmail(to)` — sent after OTP verification succeeds
- [x] `sendPasswordResetEmail(to, resetUrl)` — reset link, expires in 1 hour

### 10.5.2 Schema additions (migration: `20260430175607_add_email_features`)
- [x] `User.emailVerified Boolean @default(true)` — existing users remain verified; new registrations set to `false` explicitly
- [x] `PasswordResetToken` model — `tokenHash` (SHA-256 of raw token), `expiresAt`, `usedAt?`
- [x] `EmailVerificationOtp` model — `otpHash` (SHA-256 of 6-digit code), `expiresAt`, `usedAt?`

### 10.5.3 Password reset service (`lib/services/password-reset.ts`)
- [x] `requestPasswordReset(email)` — generates token, invalidates prior unused tokens, sends email; always returns `{ sent: true }` to prevent email enumeration
- [x] `validateResetToken(rawToken)` — checks hash, expiry, consumed state
- [x] `resetPassword(data)` — validates token, bcrypt-hashes new password, atomically updates password + marks token used

### 10.5.4 Email verification service (`lib/services/email-verification.ts`)
- [x] `sendVerificationOtp(userId)` — generates cryptographically random 6-digit OTP, SHA-256 hashes it, persists, sends email
- [x] `verifyEmailOtp(userId, otp)` — constant-time hash comparison; on success: `emailVerified = true` + sends welcome email (fire-and-forget)
- [x] `resendVerificationOtp(userId)` — 60-second cooldown guard; invalidates prior OTP then calls `sendVerificationOtp`

### 10.5.5 API routes
- [x] `POST /api/auth/forgot-password` — public; accepts `{ email }`, always returns 200
- [x] `GET  /api/auth/reset-password?token=` — public; validates token, returns `{ valid: true }` or 400
- [x] `POST /api/auth/reset-password` — public; accepts `{ token, newPassword, confirmPassword }`
- [x] `POST /api/auth/verify-email` — auth-gated; accepts `{ otp }`
- [x] `POST /api/auth/resend-otp` — auth-gated; respects 60-second cooldown

### 10.5.6 Register route updated (`app/api/auth/register/route.ts`)
- [x] New users created with `emailVerified: false`
- [x] OTP email fired after user creation (fire-and-forget — registration never fails due to email delivery)
- [x] Response includes `requiresEmailVerification: true` so the frontend can redirect to `/verify-email`

### 10.5.7 Auth session extended
- [x] `types/next-auth.d.ts` — `Session.user.isEmailVerified: boolean`, `JWT.isEmailVerified: boolean` (named `isEmailVerified` to avoid collision with NextAuth's built-in `emailVerified: Date | null`)
- [x] `lib/auth.ts` — Prisma query selects `emailVerified`; JWT + session callbacks propagate it as `isEmailVerified`

### 10.5.8 Exit criteria
- [x] `npm run build` passes cleanly
- [x] `prisma validate` passes
- [ ] **Pending frontend:** `/verify-email` page + middleware gate on `session.user.isEmailVerified`
- [ ] **Pending frontend:** `/forgot-password` + `/reset-password` pages

---

## Phase 11 — Hardening & Security Audit

### 11.1 userId scoping audit
- [ ] Audit every function in `lib/services/` — confirm every query includes `userId` in `where`
- [ ] No service function accepts an `id` alone without also verifying it belongs to the authenticated `userId`

### 11.2 Input validation audit
- [ ] Every server action and API route validates input through a Zod schema before any DB call
- [ ] Validation errors return `{ error }` with field-level messages — never a raw Prisma error

### 11.3 Money arithmetic audit
- [ ] Grep for `parseFloat`, `Number(`, and `Math.` in service files — remove any usage on monetary values
- [ ] All monetary sums use `Decimal` arithmetic (`add`, `sub`, `mul`)

### 11.4 Environment variable audit
- [ ] `GEMINI_API_KEY` appears only in `app/api/insights/route.ts` and `.env`
- [ ] `npm run build` output — verify no env variable names appear in client bundle

### 11.5 Code quality
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — clean with no TypeScript errors
- [ ] No `any` types in service layer — use `unknown` with narrowing or explicit types

### 11.6 Exit criteria
- [ ] All items in 11.1–11.5 checked green
- [ ] `npm run build` passes

---

## Notes

- **Phase order matters.** Services depend on each other: Dashboard (Phase 7) aggregates from Transactions (Phase 4), Budgets (Phase 5), and Goals (Phase 6). AI Insights (Phase 9) depends on all three.
- **No raw SQL.** All DB access goes through Prisma. If you think you need raw SQL, reconsider.
- **No new dependencies** without team sign-off. The existing stack covers everything in scope.
- **Budget amounts are not converted on currency change.** Currency is display-only. Never apply exchange rates.
- **AI provider changed from Anthropic → Google.** `@anthropic-ai/sdk` is superseded by `@google/genai`. Model: `gemini-2.5-flash`. Key: `GEMINI_API_KEY`. SSE format: `data: <JSON string>\n\n`, terminated with `data: [DONE]\n\n`.
- **Transactional email via Brevo (`@getbrevo/brevo` v5).** OTP = 6-digit, SHA-256 hashed, 15-min TTL. Reset token = 32-byte hex, SHA-256 hashed, 1-hour TTL. `BREVO_SENDER_EMAIL` must be verified in the Brevo dashboard or every send returns 403.
- **`isEmailVerified` gate is NOT yet in middleware.** The middleware must not redirect on `isEmailVerified: false` until the frontend `/verify-email` page exists. When ready, add `if (!session.user.isEmailVerified && pathname !== "/verify-email") redirect("/verify-email")` to `proxy.ts`.
