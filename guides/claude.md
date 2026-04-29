# CLAUDE.md — Finora Budget Planner

This file is the authoritative reference for the AI assistant working inside this codebase.
Read it fully before making any suggestions, generating code, or answering questions about the project.

---

## Project Overview

**Finora** is a personal budget planning web app built with Next.js. It is a single-user-per-account
architecture — each registered user manages their own income, expenses, savings goals, and budgets
in complete isolation. It is NOT a multi-tenant SaaS and there is no concept of shared budgets
between accounts (household mode is out of scope for MVP).

The app targets individuals who want a clean, fast, and honest picture of their personal finances.
It should feel like premium fintech software — polished, trustworthy, and calm — not a generic
student project.

The default currency is **GHS (Ghanaian Cedi, ₵)** but users can switch to any supported currency
in their profile settings. Currency preference is stored per-user and applied globally across all
views and calculations.

The **AI Insights** feature is a dedicated page (not scattered throughout the app). The core
budget planner — tracking income, expenses, categories, and goals — is entirely deterministic and
does not depend on AI. The AI page is an optional enhancement that users visit intentionally.

**Target completion: 14-day sprint**

---

## Project Name

**Finora** (Swahili/pan-African for "money"). Applied to `package.json`, the `<title>` tag, and
the sidebar branding component. Do not use a placeholder.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend + Backend | Next.js 14+ (App Router) | Single repo, fullstack |
| ORM | Prisma | All DB access goes through Prisma — never raw SQL |
| Database | Neon PostgreSQL | Serverless Postgres; use connection pooling |
| UI Components | shadcn/ui | Primary component library — prefer these over custom |
| Styling | Tailwind CSS | Utility-first; extend theme with design tokens |
| Icons | Lucide React | Use consistently — no mixing of icon libraries |
| Auth | Auth.js (NextAuth v5) | Credentials provider (email + password) |
| Charts | Recharts | Budget breakdowns, spending trends, savings progress |
| AI | Anthropic Claude API | Used only on the `/insights` page |
| Validation | Zod | All form and API input validation |
| Toasts | Sonner | All success/error feedback — never `alert()` |

**Never introduce new dependencies without a clear reason.** If a feature can be built with the
existing stack, do not add a new library.

---

## Architecture

```
Client (Next.js React + shadcn/ui + Tailwind)
         ↓
Server Actions / API Routes  (Next.js App Router)
         ↓
Prisma ORM  (type-safe queries, schema migrations)
         ↓
Neon PostgreSQL  (cloud-hosted, serverless)

AI Insights page only:
Client → /api/insights → Anthropic Claude API
                       ↗ (reads aggregated user data from DB, sends as context)
```

- Prefer **Server Actions** over API Routes for form submissions and mutations.
- Use **API Routes** for endpoints the client polls directly (e.g., AI insights stream).
- Keep business logic in `lib/services/` — not inline in components or route handlers.
- Never fetch data directly in Client Components. Pass as props from Server Components.
- The Anthropic API key lives server-side only. Never expose it to the client.

---

## Folder Structure

Follow this structure exactly. Do not deviate without a strong reason.

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                        # Protected routes (require session)
│   │   ├── layout.tsx                # Sidebar layout wrapper
│   │   ├── dashboard/page.tsx        # Overview: balances, recent transactions, quick stats
│   │   ├── transactions/
│   │   │   ├── page.tsx              # Full transaction history with filters
│   │   │   └── new/page.tsx          # Add income or expense
│   │   ├── budgets/
│   │   │   ├── page.tsx              # Budget categories and monthly limits
│   │   │   └── [id]/page.tsx         # Single budget category detail + history
│   │   ├── goals/
│   │   │   ├── page.tsx              # Savings goals list
│   │   │   └── [id]/page.tsx         # Single goal detail + contribution history
│   │   ├── insights/page.tsx         # AI-powered analysis page (isolated)
│   │   ├── reports/page.tsx          # Charts: spending trends, category breakdown, monthly summary
│   │   └── settings/page.tsx         # Profile, currency, notification preferences
│   └── api/
│       ├── insights/route.ts         # Streams AI response using Anthropic SDK
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                           # shadcn/ui generated (do not edit)
│   ├── dashboard/                    # Summary cards, recent activity, quick-add
│   ├── transactions/                 # Transaction list, filters, form
│   ├── budgets/                      # Budget progress bars, category cards
│   ├── goals/                        # Goal cards, contribution form, progress ring
│   ├── insights/                     # AI chat interface, insight cards
│   ├── reports/                      # Recharts wrappers, chart containers
│   └── shared/                       # Sidebar, header, theme toggle, empty states
├── lib/
│   ├── db.ts                         # Prisma client singleton
│   ├── auth.ts                       # Auth.js config + session helpers
│   ├── currency.ts                   # Currency formatting, conversion helpers
│   ├── services/
│   │   ├── transactions.ts
│   │   ├── budgets.ts
│   │   ├── goals.ts
│   │   ├── reports.ts
│   │   └── insights.ts               # Builds AI context payload from DB data
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── types/
    └── index.ts                      # All shared TypeScript types
```

---

## Color Scheme

The design uses a **yellow-on-dark** identity. Yellow (#FFD100) is the primary accent.
Dark charcoal (#202020) is the secondary base. Both light and dark mode are supported.

### CSS Custom Properties (define in `app/globals.css`)

```css
:root {
  /* --- Main Brand --- */
  --color-primary:           #FFD100;
  --color-primary-hover:     #e6bc00;
  --color-primary-active:    #ccaa00;
  --color-secondary:         #202020;
  --color-tertiary:          #ffffff;
  --color-tertiary-hover:    #f5f5f5;
  --color-section-bg:        #fffdf5;

  /* --- Neutral Grays --- */
  --color-neutral-1:  #ffffff;
  --color-neutral-2:  #f7f7f7;
  --color-neutral-3:  #ededed;
  --color-neutral-4:  #d6d6d6;
  --color-neutral-5:  #bfbfbf;
  --color-neutral-6:  #999999;
  --color-neutral-7:  #737373;
  --color-neutral-8:  #595959;
  --color-neutral-9:  #3a3a3a;
  --color-neutral-10: #202020;
  --color-neutral-11: #121212;

  /* --- Yellow Scale --- */
  --color-yellow-1:  #fffdf5;
  --color-yellow-2:  #fff7cc;
  --color-yellow-3:  #fff099;
  --color-yellow-4:  #ffe866;
  --color-yellow-5:  #ffe033;
  --color-yellow-6:  #FFD100;   /* primary */
  --color-yellow-7:  #e6bc00;
  --color-yellow-8:  #ccaa00;
  --color-yellow-9:  #b39700;
  --color-yellow-10: #997f00;
  --color-yellow-11: #806800;

  /* --- Dark Scale --- */
  --color-dark-1:  #f2f2f2;
  --color-dark-6:  #4d4d4d;
  --color-dark-7:  #333333;
  --color-dark-8:  #202020;
  --color-dark-9:  #1a1a1a;
  --color-dark-10: #141414;
  --color-dark-11: #0d0d0d;

  /* --- Semantic --- */
  --color-success-bg:  #f0fdf4;
  --color-success:     #22c55e;
  --color-success-dark:#15803d;

  --color-error-bg:    #fef2f2;
  --color-error:       #f04438;
  --color-error-dark:  #b42318;

  --color-warning-bg:  #fffdf5;
  --color-warning:     #FFD100;
  --color-warning-dark:#ccaa00;

  /* --- Light Mode Semantic Aliases --- */
  --bg-main:        #fffdf5;
  --bg-card:        #ffffff;
  --bg-muted:       #f7f7f7;
  --border-light:   #ededed;
  --border-medium:  #d6d6d6;
  --text-primary:   #1a1a1a;
  --text-secondary: #595959;
  --text-muted:     #999999;
  --text-inverse:   #ffffff;
}

.dark {
  --bg-main:        #141414;
  --bg-card:        #1a1a1a;
  --bg-muted:       #202020;
  --border-light:   #333333;
  --border-medium:  #4d4d4d;
  --text-primary:   #f2f2f2;
  --text-secondary: #bfbfbf;
  --text-muted:     #737373;
  --text-inverse:   #1a1a1a;

  --color-section-bg: #1a1a1a;
}
```

### Tailwind Extension

Extend `tailwind.config.ts` to map these tokens so you can write `bg-primary`, `text-muted`, etc.:

```ts
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "var(--color-primary)",
        hover:   "var(--color-primary-hover)",
        active:  "var(--color-primary-active)",
      },
      secondary: "var(--color-secondary)",
      "bg-main":   "var(--bg-main)",
      "bg-card":   "var(--bg-card)",
      "bg-muted":  "var(--bg-muted)",
      "text-primary":   "var(--text-primary)",
      "text-secondary": "var(--text-secondary)",
      "text-muted":     "var(--text-muted)",
      "border-light":   "var(--border-light)",
      "border-medium":  "var(--border-medium)",
    }
  }
}
```

### Theme Toggle

A dark/light mode toggle must live in the sidebar footer and the settings page. Use `next-themes`
for theme persistence. The toggle uses a Lucide `Sun` / `Moon` icon — no text labels.

---

## Database Schema

This is the canonical schema. All Prisma models must match this exactly.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum TransactionType {
  INCOME
  EXPENSE
}

enum GoalStatus {
  ACTIVE
  COMPLETED
  PAUSED
}

enum RecurrenceFrequency {
  NONE
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}

// ─── Models ──────────────────────────────────────────────────────────────────

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  password     String                        // bcrypt hashed
  currency     String   @default("GHS")      // ISO 4217 code, user-configurable
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  transactions Transaction[]
  budgets      Budget[]
  goals        Goal[]
  categories   Category[]

  @@index([email])
}

model Category {
  id        String   @id @default(cuid())
  userId    String
  name      String                           // e.g. "Food & Drink", "Rent", "Salary"
  type      TransactionType                  // INCOME or EXPENSE
  icon      String?                          // Lucide icon name string
  color     String?                          // Hex color for charts
  createdAt DateTime @default(now())

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets      Budget[]

  @@unique([userId, name])
  @@index([userId])
}

model Transaction {
  id          String              @id @default(cuid())
  userId      String
  categoryId  String
  type        TransactionType
  amount      Decimal             @db.Decimal(14, 2)   // always positive; type determines direction
  note        String?
  date        DateTime                                  // user-specified date of transaction
  recurrence  RecurrenceFrequency @default(NONE)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id])

  @@index([userId])
  @@index([userId, date])
  @@index([userId, type])
  @@index([categoryId])
}

model Budget {
  id         String   @id @default(cuid())
  userId     String
  categoryId String
  limitAmount Decimal @db.Decimal(14, 2)   // monthly spend limit for this category
  month      Int                            // 1–12
  year       Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id])

  @@unique([userId, categoryId, month, year])
  @@index([userId, year, month])
}

model Goal {
  id            String     @id @default(cuid())
  userId        String
  name          String                       // e.g. "Emergency Fund", "New Laptop"
  targetAmount  Decimal    @db.Decimal(14, 2)
  savedAmount   Decimal    @db.Decimal(14, 2) @default(0)
  deadline      DateTime?
  status        GoalStatus @default(ACTIVE)
  icon          String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  contributions GoalContribution[]

  @@index([userId])
  @@index([userId, status])
}

model GoalContribution {
  id        String   @id @default(cuid())
  goalId    String
  amount    Decimal  @db.Decimal(14, 2)
  note      String?
  date      DateTime
  createdAt DateTime @default(now())

  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId])
}
```

### Schema Rules

- Always use `cuid()` for IDs.
- All monetary values are `Decimal @db.Decimal(14,2)` — never `Float`. Floating point breaks money.
- `Transaction.amount` is always **positive**. The `type` field (INCOME/EXPENSE) determines its
  direction in all calculations.
- `Budget` is per-category per-month. To check if a user is over budget, sum all EXPENSE
  transactions in that category for the given month and compare against `limitAmount`.
- `GoalContribution` records individual top-ups to a goal. `Goal.savedAmount` is the running total
  and must be updated atomically alongside each contribution insert.
- Every query must be scoped to `userId`. A missing `userId` filter is a data leak and a security bug.

---

## Authentication & Authorization

- Auth.js v5 with **Credentials provider** (email + password).
- Passwords are bcrypt-hashed before storage. Never store or log plain text.
- After login, if the user has no transactions/categories yet, redirect to an onboarding flow that
  seeds default categories and prompts for first income entry.
- All `(app)/` routes are protected by middleware session check.
- There are no roles — every authenticated user has full access to their own data only.
- Session carries: `id`, `name`, `email`, `currency`.

---

## Key Feature Specifications

### Dashboard (`/dashboard`)

The first thing a user sees. Must load fast and feel alive.

**Sections:**
- **Balance summary card** — total income vs. total expenses for the current month, net balance.
- **Budget health strip** — horizontal list of category budgets with fill bars (green/amber/red
  based on % used). Click → goes to `/budgets`.
- **Savings goals preview** — top 3 active goals with progress rings. Click → goes to `/goals`.
- **Recent transactions** — last 8 transactions with category icon, amount, and date.
- **Quick-add button** — floating `+` button or sticky CTA to `/transactions/new`.

### Transactions (`/transactions`)

Full ledger view of all income and expenses.

- Filter by: date range, type (income/expense), category, amount range.
- Sort by: date (default), amount.
- Pagination — 25 per page.
- Each row: date, category icon + name, note (truncated), amount (green for income, red for expense).
- Clicking a transaction opens a Sheet (shadcn/ui) with full detail + edit/delete actions.
- Add transaction form (`/transactions/new`):
  - Required: type, amount, category, date.
  - Optional: note, recurrence.
  - Zod validation on all fields server-side.

### Budgets (`/budgets`)

Monthly spending limits per category.

- Grid of category budget cards. Each card shows:
  - Category name + icon
  - Amount spent / limit (e.g., ₵340 / ₵500)
  - Progress bar — green below 75%, amber 75–99%, red at 100%+
  - "Over budget" badge if exceeded
- Users can create a budget for any EXPENSE category.
- Budget is month-scoped. Viewing previous months is supported via a month picker.
- If no budget is set for a category, it appears as "No limit set."

### Savings Goals (`/goals`)

Target-based savings tracking.

- Goal cards with:
  - Name, target amount, saved amount
  - Circular progress ring (yellow fill on dark background)
  - Deadline countdown if set (e.g., "42 days left")
  - Status badge (Active / Completed / Paused)
- Add contribution form on the goal detail page — records a `GoalContribution` and updates
  `Goal.savedAmount` atomically.
- Mark goal as complete when `savedAmount >= targetAmount`.

### AI Insights (`/insights`) — Isolated Feature

This page is intentionally separate from the rest of the app. It does NOT embed AI tips
inline across other pages.

**What it does:**
1. **Spending pattern analysis** — "You spent 43% more on food this month than last month."
2. **Expense forecasting** — "Based on your patterns, you'll likely spend ₵2,100 in October."
3. **Natural language Q&A** — User can ask: "How much did I spend on transport in July?"
   "Am I on track to hit my Emergency Fund goal?" "Where can I cut back this month?"
4. **Actionable tips** — Specific, numbered suggestions based on actual user data.

**Technical implementation:**
- On page load, `lib/services/insights.ts` queries the DB and builds a structured JSON summary:
  - Last 3 months of transactions (aggregated by category + week, not raw rows)
  - Current budget statuses (category, limit, spent, % used)
  - Active goals (name, target, saved, deadline)
  - User's currency preference
- This summary is sent as context in the system prompt to `claude-sonnet-4-20250514`.
- The `/api/insights` route streams the response back using the Anthropic SDK.
- The UI is a **chat interface** — user sends a question, AI responds below it. Previous Q&A
  pairs are kept in local component state for the session (no DB persistence of chat history).
- A set of **pre-written prompt chips** appear on first load:
  - "Analyse my spending this month"
  - "Where am I overspending?"
  - "Am I on track with my savings goals?"
  - "Predict my expenses for next month"
- The AI must always ground responses in actual data from the context. It must not hallucinate
  numbers. If data is insufficient, it must say so clearly.

**Tone:** The AI should sound like a calm, knowledgeable financial advisor — not a chatbot.
No filler phrases. No "Great question!" openers. Direct and specific.

### Reports (`/reports`)

Static, chart-heavy analytics page. No AI — just clean data visualisation.

- **Monthly spending by category** — horizontal bar chart (Recharts).
- **Income vs. Expenses trend** — line chart over the last 6 months.
- **Daily spending heatmap** — calendar-style heat map for the current month.
- **Category breakdown** — donut chart showing % of total spend per category.
- Month/year selector to navigate historical data.

### Settings (`/settings`)

- Update display name and email.
- Change password (current + new + confirm).
- **Currency selector** — searchable dropdown of ISO 4217 currencies. Changing currency
  updates `User.currency` and re-renders all monetary values across the app immediately.
- **Dark / Light mode toggle.**
- **Manage categories** — add, rename, delete custom categories (cannot delete if transactions exist).
- **Danger zone** — delete account (requires password confirmation, cascades all data).

---

## Currency Handling

- The user's selected currency is stored in `User.currency` as an ISO 4217 code (e.g., `"GHS"`, `"USD"`, `"GBP"`).
- Default is `"GHS"` (Ghanaian Cedi, symbol ₵).
- A `lib/currency.ts` module must export:

```ts
export function formatCurrency(amount: Decimal | number | string, currency: string): string
// Returns formatted string: "₵1,200.00", "$45.99", "£300.00" etc.
// Uses Intl.NumberFormat with the correct locale and currency symbol.

export const SUPPORTED_CURRENCIES: { code: string; name: string; symbol: string }[]
// Full list of supported ISO 4217 currencies for the settings dropdown.
```

- **No live exchange rate conversion is performed.** Currency is a display preference only —
  all amounts are stored as-entered. If a user changes currency, amounts display in the new
  symbol without numeric conversion.

---

## UI & Design Directives

- **No emojis as icons.** Use Lucide React SVG icons exclusively.
- `cursor-pointer` on all interactive elements.
- Hover states with smooth `transition-all duration-200`.
- All protected pages use a **fixed left sidebar** with icon + label navigation.
- Sidebar is collapsible to icon-only on desktop. On mobile it becomes a bottom drawer/sheet.

**Component rules:**
- `Card` (shadcn/ui) for all stat containers, form panels, and data sections.
- `Badge` for statuses: budget health (green/amber/red), goal status (active/completed/paused).
- `Dialog` or `Sheet` for confirmations, transaction detail, contributions.
- `Sonner` for all toasts. Never `alert()` or `confirm()`.
- `Table` (shadcn/ui) for transaction history. Include loading skeletons.
- `Progress` (shadcn/ui) for budget fill bars.

**Visual polish:**
- Cards use subtle shadows: `shadow-sm` in light mode, no shadow + `border border-border-light` in dark.
- Border radius: `rounded-2xl` for cards and modals, `rounded-lg` for inputs/buttons.
- Typography hierarchy:
  - Page title: `text-2xl font-bold`
  - Section heading: `text-lg font-semibold`
  - Body: `text-sm`
  - Label / caption: `text-xs text-muted`
- Primary buttons: `bg-primary text-secondary font-semibold` (yellow bg, dark text).
- Sidebar active state: yellow left border + yellow text + subtle yellow tinted background.
- Income amounts: green (`--color-success`). Expense amounts: red (`--color-error`).

---

## Coding Conventions

**TypeScript:** Strict mode on. No `any` — use `unknown` and narrow, or define explicit types.
All shared types live in `types/index.ts`.

**Naming:**
- Components: `PascalCase` (`TransactionCard.tsx`)
- Services and utilities: `camelCase` (`createTransaction.ts`)
- DB service files: mirror model name (`transactions.ts`, `goals.ts`)
- Constants: `SCREAMING_SNAKE_CASE`

**Service layer pattern:**
```ts
// lib/services/transactions.ts
export async function createTransaction(userId: string, data: unknown) {
  const parsed = CreateTransactionSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const transaction = await prisma.transaction.create({
    data: { ...parsed.data, userId },
  })
  return { data: transaction }
}
```

**Error handling:** All errors caught at service layer, returned as `{ error: string }`.
Never let Prisma errors surface to the client. `console.error` server-side in development.

**DB queries:** Always filter by `userId`. This is the security boundary.

```ts
// ✅ Correct
const transactions = await prisma.transaction.findMany({ where: { userId } })

// ❌ Wrong — exposes all users' data
const transactions = await prisma.transaction.findMany()
```

**Prisma singleton:**
```ts
// lib/db.ts
import { PrismaClient } from "@prisma/client"
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

**Money arithmetic:** Always use `Decimal` from `@prisma/client/runtime/library` or pass as
strings. Never use JavaScript `number` for financial sums — floating point arithmetic is wrong
for money.

---

## Environment Variables

```
DATABASE_URL=           # Neon PostgreSQL pooled connection string
DIRECT_URL=             # Neon direct (non-pooled) connection string for migrations
NEXTAUTH_SECRET=        # 32-char random string for session signing
NEXTAUTH_URL=           # Full app URL (http://localhost:3000 in dev)
ANTHROPIC_API_KEY=      # Server-side only — never expose to client
```

Never commit `.env.local`. The `ANTHROPIC_API_KEY` must never appear in client bundles.

---

## 14-Day Sprint Reference

| Phase | Days | Focus |
|---|---|---|
| Foundation | 1–2 | Setup, schema, auth, onboarding |
| Core Data | 3–5 | Categories, transactions CRUD, currency formatting |
| Budget Module | 6–7 | Budget creation, progress tracking, over-budget alerts |
| Goals Module | 8–9 | Savings goals, contributions, progress rings |
| Reports + Polish | 10–11 | Recharts reports page, dashboard polish, dark mode |
| AI Insights | 12–13 | Context builder, Anthropic API integration, chat UI |
| Hardening | 14 | Tests, edge cases, accessibility, final QA |

**In scope for MVP:** All features above.
**Out of scope for MVP:** Shared/household budgets, bank integrations, export to CSV/PDF,
push notifications, recurring transaction auto-creation, mobile app.
**Stretch goals:** Recurring transaction automation, PDF export, budget templates, spending streaks.

---

## Common Pitfalls to Avoid

- **Missing `userId` in queries.** Every Prisma query on user-owned data must be scoped. This is a security bug.
- **Using `Float` for money.** Always `Decimal`. Period.
- **Exposing `ANTHROPIC_API_KEY` client-side.** The AI call must only happen inside a server-side API route.
- **Sending raw transaction rows to the AI.** Build an aggregated summary in `lib/services/insights.ts`. Don't send thousands of rows as context — summarise by category and period.
- **Calling `new PrismaClient()` outside the singleton.** Always import from `lib/db.ts`.
- **Using `alert()` or `confirm()`.** Use shadcn/ui `Dialog` and `Sonner` toasts.
- **Numeric conversion on currency change.** Currency is a display-only preference. Never multiply/divide stored amounts on currency switch.
- **Forgetting dark mode.** Every component must use CSS variable-based colors so dark mode works via the `.dark` class toggle.

---

*Keep this file up to date as the project evolves. Schema changes → update the schema section.
New conventions → add to Coding Conventions. Scope changes → update the sprint reference.*
