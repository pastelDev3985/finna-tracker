# Finora — Backend Developer Checklist

> **Scope:** Everything that runs on the server — database schema, Prisma ORM, Auth.js, service layer, API routes, server actions, security, and environment configuration.
>
> Work through phases **in order**. Do not start Phase N+1 until all exit criteria for Phase N are met.
> Mark tasks `[x]` as they are completed.

---

## Non-Negotiable Rules (Read Before Touching Anything)

- [ ] Every Prisma query on user-owned data **must** include `where: { userId }`. A missing scope is a data-leak security bug.
- [ ] All monetary DB fields use `Decimal @db.Decimal(14,2)`. **Never `Float`.**
- [ ] `ANTHROPIC_API_KEY` lives server-side only. Never reference it in any client-facing file.
- [ ] Always import the Prisma client from `lib/db.ts`. Never call `new PrismaClient()` elsewhere.
- [ ] All errors are caught at the service layer and returned as `{ error: string }`. Never let Prisma errors surface to the client.
- [ ] Use `cuid()` for all model IDs — never `uuid()`, never auto-increment.
- [ ] Passwords are bcrypt-hashed before storage. Never log or return plain-text passwords.

---

## Phase 0 — Foundation & Infrastructure

### 0.1 Project scaffold
- [ ] Next.js 14+ app created with App Router and TypeScript
- [ ] `strict: true` enabled in `tsconfig.json`
- [ ] ESLint + Prettier configured and passing

### 0.2 Runtime dependencies installed
- [ ] `@prisma/client`
- [ ] `zod`
- [ ] `next-auth` (Auth.js v5)
- [ ] `bcryptjs` + `@types/bcryptjs`
- [ ] `@anthropic-ai/sdk`
- [ ] `sonner` (used by server actions for response feedback)

### 0.3 Dev dependencies installed
- [ ] `prisma` (dev)

### 0.4 Environment variables
- [ ] `.env.local` created (never committed) with:
  - [ ] `DATABASE_URL` — Neon PostgreSQL **pooled** connection string
  - [ ] `DIRECT_URL` — Neon **direct** (non-pooled) string for migrations
  - [ ] `NEXTAUTH_SECRET` — 32-char random string
  - [ ] `NEXTAUTH_URL` — `http://localhost:3000` in dev
  - [ ] `ANTHROPIC_API_KEY` — server-side only

### 0.5 Prisma initialised
- [ ] `prisma/schema.prisma` created with correct datasource + generator block
- [ ] `lib/db.ts` Prisma singleton added:
  ```ts
  import { PrismaClient } from "@prisma/client"
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
  ```
- [ ] `prisma.config.ts` added if using Prisma v7 config-file approach

### 0.6 Exit criteria
- [ ] `npx prisma validate` passes
- [ ] `npm run build` passes on clean scaffold

---

## Phase 1 — Database Schema & Migrations

### 1.1 Enums (define before models)
- [ ] `TransactionType` — `INCOME | EXPENSE`
- [ ] `GoalStatus` — `ACTIVE | COMPLETED | PAUSED`
- [ ] `RecurrenceFrequency` — `NONE | DAILY | WEEKLY | MONTHLY | YEARLY`

### 1.2 Models — exact field types

**User**
- [ ] `id String @id @default(cuid())`
- [ ] `name String`
- [ ] `email String @unique`
- [ ] `password String` (bcrypt hash)
- [ ] `currency String @default("GHS")`
- [ ] `createdAt DateTime @default(now())`
- [ ] `updatedAt DateTime @updatedAt`
- [ ] Relations: `transactions Transaction[]`, `budgets Budget[]`, `goals Goal[]`, `categories Category[]`
- [ ] `@@index([email])`

**Category**
- [ ] `id String @id @default(cuid())`
- [ ] `userId String`
- [ ] `name String`
- [ ] `type TransactionType`
- [ ] `icon String?` (Lucide icon name)
- [ ] `color String?` (hex for charts)
- [ ] `createdAt DateTime @default(now())`
- [ ] Relation to `User` with `onDelete: Cascade`
- [ ] `@@unique([userId, name])`
- [ ] `@@index([userId])`

**Transaction**
- [ ] `id String @id @default(cuid())`
- [ ] `userId String`
- [ ] `categoryId String`
- [ ] `type TransactionType`
- [ ] `amount Decimal @db.Decimal(14, 2)` — always positive
- [ ] `note String?`
- [ ] `date DateTime` (user-specified)
- [ ] `recurrence RecurrenceFrequency @default(NONE)`
- [ ] `createdAt DateTime @default(now())`
- [ ] `updatedAt DateTime @updatedAt`
- [ ] Relations to `User` (`onDelete: Cascade`) and `Category`
- [ ] Indexes: `[userId]`, `[userId, date]`, `[userId, type]`, `[categoryId]`

**Budget**
- [ ] `id String @id @default(cuid())`
- [ ] `userId String`
- [ ] `categoryId String`
- [ ] `limitAmount Decimal @db.Decimal(14, 2)`
- [ ] `month Int` (1–12)
- [ ] `year Int`
- [ ] `createdAt DateTime @default(now())`
- [ ] `updatedAt DateTime @updatedAt`
- [ ] Relations to `User` (`onDelete: Cascade`) and `Category`
- [ ] `@@unique([userId, categoryId, month, year])`
- [ ] `@@index([userId, year, month])`

**Goal**
- [ ] `id String @id @default(cuid())`
- [ ] `userId String`
- [ ] `name String`
- [ ] `targetAmount Decimal @db.Decimal(14, 2)`
- [ ] `savedAmount Decimal @db.Decimal(14, 2) @default(0)`
- [ ] `deadline DateTime?`
- [ ] `status GoalStatus @default(ACTIVE)`
- [ ] `icon String?`
- [ ] `createdAt DateTime @default(now())`
- [ ] `updatedAt DateTime @updatedAt`
- [ ] Relation to `User` (`onDelete: Cascade`), `contributions GoalContribution[]`
- [ ] Indexes: `[userId]`, `[userId, status]`

**GoalContribution**
- [ ] `id String @id @default(cuid())`
- [ ] `goalId String`
- [ ] `amount Decimal @db.Decimal(14, 2)`
- [ ] `note String?`
- [ ] `date DateTime`
- [ ] `createdAt DateTime @default(now())`
- [ ] Relation to `Goal` with `onDelete: Cascade`
- [ ] `@@index([goalId])`

### 1.3 Migration & generation
- [ ] Initial migration created and applied: `npx prisma migrate dev --name init`
- [ ] Prisma client regenerated: `npx prisma generate`

### 1.4 Exit criteria
- [ ] `npx prisma validate` passes with all models
- [ ] `npm run build` passes

---

## Phase 2 — Authentication

### 2.1 Auth.js configuration
- [ ] `lib/auth.ts` — Auth.js v5 `NextAuth` config with `Credentials` provider
  - [ ] `authorize` function: find user by email → compare bcrypt hash → return session payload
  - [ ] Session strategy: `"jwt"` (default for credentials)
  - [ ] Session callback: attach `id` and `currency` to the session token
- [ ] `app/api/auth/[...nextauth]/route.ts` — export `{ GET, POST }` from `lib/auth.ts`

### 2.2 Session type extension
- [ ] `types/next-auth.d.ts` — extends `Session.user` with `id: string` and `currency: string`

### 2.3 Register endpoint
- [ ] `app/api/auth/register/route.ts` — POST handler:
  - [ ] Validate input with Zod (`name`, `email`, `password` — min 8 chars)
  - [ ] Check email uniqueness before insert
  - [ ] Hash password with `bcryptjs` (rounds: 12)
  - [ ] Create user with `prisma.user.create`
  - [ ] Return `201` on success, `409` on duplicate email, `400` on validation error

### 2.4 Middleware
- [ ] `middleware.ts` — protects all `(app)/` routes
  - [ ] Unauthenticated requests redirect to `/login`
  - [ ] Already-authenticated users on `/login` or `/register` redirect to `/dashboard`
  - [ ] `matcher` configured to exclude `_next/static`, `_next/image`, and `api/auth`

### 2.5 Exit criteria
- [ ] User can register with a new email
- [ ] Duplicate email returns a clear error
- [ ] Correct credentials → session created
- [ ] Wrong credentials → error message (no detail about which field is wrong)
- [ ] `GET /dashboard` unauthenticated → redirects to `/login`

---

## Phase 3 — Category Service

### 3.1 Zod schemas (`lib/services/categories.ts` or `lib/schemas/`)
- [ ] `CreateCategorySchema` — `{ name: string, type: TransactionType, icon?: string, color?: string }`
- [ ] `UpdateCategorySchema` — partial of `CreateCategorySchema`

### 3.2 Service functions (all scoped to `userId`)
- [ ] `listCategories(userId, type?)` — returns all or filtered by `TransactionType`
- [ ] `createCategory(userId, data)` — Zod validated; returns `{ data }` or `{ error }`
- [ ] `updateCategory(userId, id, data)` — verifies ownership before update
- [ ] `deleteCategory(userId, id)` — **fails with clear error if any transactions reference this category**

### 3.3 Default category seeding
- [ ] `prisma/seed.ts` or inline in onboarding server action — seeds default categories per user:
  - Income: `Salary`, `Freelance`, `Business`, `Investment`, `Other Income`
  - Expense: `Food & Drink`, `Transport`, `Housing`, `Utilities`, `Healthcare`, `Shopping`, `Entertainment`, `Education`, `Savings Transfer`, `Other`

### 3.4 Exit criteria
- [ ] Calling `listCategories(userId)` returns only that user's categories
- [ ] Attempting to delete a category with linked transactions returns `{ error }` not a crash

---

## Phase 4 — Transaction Service

### 4.1 Zod schemas
- [ ] `CreateTransactionSchema` — `{ categoryId, type, amount (positive), date, note?, recurrence? }`
- [ ] `UpdateTransactionSchema` — partial of above
- [ ] `TransactionFiltersSchema` — `{ startDate?, endDate?, type?, categoryId?, page?, limit? }`

### 4.2 Service functions (all scoped to `userId`)
- [ ] `listTransactions(userId, filters)` — paginated (25/page), supports: date range, type, categoryId; default sort: `date desc`
- [ ] `getTransactionById(userId, id)` — verifies ownership
- [ ] `createTransaction(userId, data)` — Zod validated
- [ ] `updateTransaction(userId, id, data)` — verifies ownership before update
- [ ] `deleteTransaction(userId, id)` — verifies ownership before delete

### 4.3 Summary query
- [ ] `getTransactionSummary(userId, month, year)` — returns `{ totalIncome, totalExpenses, net }` for the given month using `Decimal` arithmetic

### 4.4 Currency utility
- [ ] `lib/currency.ts` created with:
  - [ ] `formatCurrency(amount: Decimal | number | string, currency: string): string` — uses `Intl.NumberFormat`
  - [ ] `SUPPORTED_CURRENCIES: { code: string; name: string; symbol: string }[]` — all ISO 4217 currencies needed for settings dropdown

### 4.5 Exit criteria
- [ ] `createTransaction` rejects negative amounts and missing required fields
- [ ] `listTransactions` pagination returns correct page and total count
- [ ] `getTransactionSummary` returns correct totals using `Decimal` (not JS `number`)

---

## Phase 5 — Budget Service

### 5.1 Zod schemas
- [ ] `UpsertBudgetSchema` — `{ categoryId, limitAmount (positive), month (1–12), year }`

### 5.2 Service functions (all scoped to `userId`)
- [ ] `listBudgets(userId, month, year)` — returns all budgets for the month with computed `spentAmount` joined
  - Spend = sum of EXPENSE transactions for that category in that month
- [ ] `getBudgetWithSpend(userId, categoryId, month, year)` — single-category budget + actual spend
- [ ] `upsertBudget(userId, data)` — uses `@@unique([userId, categoryId, month, year])` constraint; create or update
- [ ] `deleteBudget(userId, id)` — verifies ownership

### 5.3 Exit criteria
- [ ] `listBudgets` correctly reflects real spend from transactions
- [ ] `upsertBudget` updates an existing record instead of creating a duplicate
- [ ] Categories with no budget return `null` for `limitAmount` (not an error)

---

## Phase 6 — Goals Service

### 6.1 Zod schemas
- [ ] `CreateGoalSchema` — `{ name, targetAmount (positive), deadline?, icon? }`
- [ ] `UpdateGoalSchema` — partial of above plus `status?`
- [ ] `AddContributionSchema` — `{ amount (positive), note?, date }`

### 6.2 Service functions (all scoped to `userId`)
- [ ] `listGoals(userId)` — all goals with contribution totals
- [ ] `getGoalById(userId, id)` — with full contribution history
- [ ] `createGoal(userId, data)` — Zod validated
- [ ] `updateGoal(userId, id, data)` — verifies ownership
- [ ] `deleteGoal(userId, id)` — cascades contributions via schema relation
- [ ] `addContribution(userId, goalId, amount, note?, date)`:
  - [ ] Atomic: `prisma.$transaction([insertContribution, updateGoalSavedAmount])`
  - [ ] After update, if `savedAmount >= targetAmount` → set `status = COMPLETED`

### 6.3 Exit criteria
- [ ] Contribution insert and `savedAmount` update are atomic (both fail or both succeed)
- [ ] Goal auto-completes the first time `savedAmount >= targetAmount`
- [ ] `deleteGoal` correctly cascades all `GoalContribution` rows

---

## Phase 7 — Dashboard Service

### 7.1 Service functions (all scoped to `userId`)
- [ ] `getDashboardSummary(userId)` — current month income, expenses, net balance
- [ ] `getBudgetHealthStrip(userId)` — all budgets for current month with `%used` computed
- [ ] `getTopGoals(userId, limit: 3)` — top 3 `ACTIVE` goals ordered by `%progress` descending
- [ ] `getRecentTransactions(userId, limit: 8)` — last 8 transactions by `date desc`, with category included

### 7.2 Exit criteria
- [ ] All four queries are scoped to the current calendar month
- [ ] `getTopGoals` never returns `COMPLETED` or `PAUSED` goals
- [ ] All queries return in < 200ms on a fresh Neon connection (check `EXPLAIN ANALYZE`)

---

## Phase 8 — Reports Service

### 8.1 Service functions (all scoped to `userId`)
- [ ] `getMonthlySpendByCategory(userId, month, year)` — grouped sums for bar chart
- [ ] `getIncomeVsExpensesTrend(userId, months: 6)` — last N months: `{ month, year, income, expenses }`
- [ ] `getDailySpend(userId, month, year)` — per-day spend totals for heatmap
- [ ] `getCategoryBreakdown(userId, month, year)` — `{ categoryName, total, percentage }` for donut chart

### 8.2 Exit criteria
- [ ] All functions return `Decimal` or serialised string values — never raw JS floats
- [ ] An empty month returns an empty array / zero values, not an error

---

## Phase 9 — AI Insights API Route

### 9.1 Context builder (`lib/services/insights.ts`)
- [ ] `buildInsightsContext(userId)` — aggregates and returns a compact JSON string:
  - [ ] Last 3 months of transactions **grouped by category + week** (totals only — not raw rows)
  - [ ] Current month budget statuses: `{ category, limitAmount, spentAmount, percentUsed, isOverBudget }`
  - [ ] All `ACTIVE` goals: `{ name, targetAmount, savedAmount, percentProgress, deadline }`
  - [ ] User: `{ name, currency }`

### 9.2 API route (`app/api/insights/route.ts`)
- [ ] POST handler only
- [ ] Auth check at the top — return `401` if no valid session
- [ ] Receives `{ message: string, history: { role: "user" | "assistant", content: string }[] }`
- [ ] Calls `buildInsightsContext(userId)` server-side
- [ ] Builds Anthropic messages array: system prompt with context + user message + history
- [ ] Streams response using `@anthropic-ai/sdk` `stream()` method with `claude-sonnet-4-20250514`
- [ ] Returns a `ReadableStream` response (`text/event-stream`)
- [ ] `ANTHROPIC_API_KEY` is never referenced in any client-facing file

### 9.3 Exit criteria
- [ ] Unauthenticated POST → `401`
- [ ] Response streams progressively (verify in network tab)
- [ ] The API key does not appear in any client bundle (verify with `npm run build` output)
- [ ] AI response is grounded: if context is insufficient, it says so clearly

---

## Phase 10 — Settings & User Management

### 10.1 Profile server actions
- [ ] `updateProfile(userId, { name, email })` — validates uniqueness on email change
- [ ] `changePassword(userId, { currentPassword, newPassword })` — bcrypt verify then hash new password

### 10.2 Currency server action
- [ ] `updateCurrency(userId, currency)` — validates currency code is in `SUPPORTED_CURRENCIES` list, updates `User.currency`

### 10.3 Account deletion
- [ ] `deleteAccount(userId, password)` — bcrypt verify password → `prisma.user.delete` (cascades all related data via schema `onDelete: Cascade`)

### 10.4 Exit criteria
- [ ] Email change fails cleanly if the new email is already in use
- [ ] Password change requires correct current password
- [ ] Account deletion with wrong password returns error; correct password deletes everything
- [ ] Cascade verified: after account delete, no orphaned `Transaction`, `Budget`, `Goal`, `Category`, or `GoalContribution` rows remain

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
- [ ] `ANTHROPIC_API_KEY` appears only in `app/api/insights/route.ts` and `.env.local`
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
