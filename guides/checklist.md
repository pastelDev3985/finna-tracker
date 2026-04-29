# Finora — Project Checklist

This checklist tracks sprint execution progress phase by phase.
Mark tasks `[x]` as they are completed. Do not skip ahead.

---

## Overall Status

- [ ] Phase 0 — Foundation & Setup
- [ ] Phase 1 — Schema, Migrations & Auth
- [ ] Phase 2 — Onboarding & Categories
- [ ] Phase 3 — Transactions Module
- [ ] Phase 4 — Budget Module
- [ ] Phase 5 — Savings Goals Module
- [ ] Phase 6 — Dashboard Polish
- [ ] Phase 7 — Reports & Charts
- [ ] Phase 8 — AI Insights Page
- [ ] Phase 9 — Settings & Theme
- [ ] Phase 10 — Quality, Hardening & Polish

---

## Phase 0 — Foundation & Setup

### 0.1 Project scaffold
- [ ] Next.js 14+ app created with App Router and TypeScript
- [ ] `strict` mode enabled in `tsconfig.json`
- [ ] ESLint + Prettier configured
- [ ] Tailwind CSS installed and configured
- [ ] `next-themes` installed for dark/light mode

### 0.2 Dependencies installed
- [ ] Runtime: `@prisma/client`, `zod`, `next-auth`, `bcryptjs`, `lucide-react`, `sonner`, `recharts`, `@anthropic-ai/sdk`
- [ ] Dev: `prisma`
- [ ] Tailwind plugins: `tailwindcss-animate` (for shadcn/ui)

### 0.3 shadcn/ui initialised
- [ ] `npx shadcn@latest init` run
- [ ] Base components installed: `button`, `card`, `input`, `label`, `badge`, `dialog`, `sheet`, `table`, `progress`, `select`, `dropdown-menu`, `avatar`, `separator`, `skeleton`, `tabs`, `tooltip`

### 0.4 Design tokens applied
- [ ] Full CSS variable set defined in `app/globals.css` (light + dark mode)
- [ ] Tailwind config extended with token aliases (`primary`, `bg-main`, `bg-card`, etc.)
- [ ] Dark mode class strategy set to `class` in `tailwind.config.ts`
- [ ] Base interactive defaults set: `cursor-pointer`, `transition-all duration-200`

### 0.5 Prisma initialised
- [ ] `prisma/schema.prisma` created with datasource + generator
- [ ] `lib/db.ts` singleton added
- [ ] `prisma.config.ts` added if using Prisma v7 config-file approach
- [ ] `.env.local` created with `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`

### 0.6 Exit criteria
- [ ] `npx prisma validate` passes
- [ ] `npm run build` passes on clean scaffold

---

## Phase 1 — Schema, Migrations & Auth

### 1.1 Prisma schema
- [ ] All models implemented: `User`, `Category`, `Transaction`, `Budget`, `Goal`, `GoalContribution`
- [ ] All enums: `TransactionType`, `GoalStatus`, `RecurrenceFrequency`
- [ ] Monetary fields use `Decimal @db.Decimal(14, 2)` — no Float anywhere
- [ ] All indexes added per `claude.md` schema section
- [ ] `cuid()` used for all IDs

### 1.2 Migration
- [ ] Initial migration created and applied: `npx prisma migrate dev --name init`
- [ ] Prisma client regenerated: `npx prisma generate`

### 1.3 Auth setup
- [ ] `lib/auth.ts` with Auth.js Credentials provider
- [ ] `app/api/auth/[...nextauth]/route.ts` route handler
- [ ] `types/next-auth.d.ts` — session extended with `id`, `currency`
- [ ] `middleware.ts` — protects all `(app)/` routes, redirects unauthenticated to `/login`
- [ ] Register endpoint: `app/api/auth/register/route.ts` with bcrypt hashing
- [ ] Login page: `app/(auth)/login/page.tsx` + `components/auth/login-form.tsx`
- [ ] Register page: `app/(auth)/register/page.tsx`

### 1.4 Exit criteria
- [ ] User can register and log in
- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] `npm run build` passes

---

## Phase 2 — Onboarding & Categories

### 2.1 App shell
- [ ] Sidebar component: `components/shared/sidebar.tsx`
  - [ ] Logo / app name "Finora" at top
  - [ ] Navigation links with Lucide icons (Dashboard, Transactions, Budgets, Goals, Reports, Insights, Settings)
  - [ ] Active state: yellow left border + yellow text
  - [ ] Collapsible to icon-only on desktop
  - [ ] Mobile: bottom sheet/drawer
  - [ ] Dark/light toggle in sidebar footer
- [ ] Protected layout: `app/(app)/layout.tsx` using sidebar
- [ ] Shared components: `components/shared/empty-state.tsx`, `components/shared/loading-state.tsx`

### 2.2 Onboarding flow
- [ ] After first login, detect if user has zero categories → redirect to `/onboarding`
- [ ] Onboarding page seeds default categories for the user:
  - Income: Salary, Freelance, Business, Investment, Other Income
  - Expense: Food & Drink, Transport, Housing, Utilities, Healthcare, Shopping, Entertainment, Education, Savings Transfer, Other
- [ ] Onboarding prompts for first income entry (optional, skippable)
- [ ] On complete, redirect to `/dashboard`

### 2.3 Category service
- [ ] `lib/services/categories.ts`:
  - [ ] `listCategories(userId, type?)` — returns all or filtered by type
  - [ ] `createCategory(userId, data)` — Zod validated
  - [ ] `updateCategory(userId, id, data)`
  - [ ] `deleteCategory(userId, id)` — fails if transactions exist for category
- [ ] All queries scoped to `userId`

### 2.4 Exit criteria
- [ ] New user sees onboarding, gets default categories seeded
- [ ] Returning user goes straight to dashboard
- [ ] Sidebar renders correctly in light and dark mode

---

## Phase 3 — Transactions Module

### 3.1 Transaction service
- [ ] `lib/services/transactions.ts`:
  - [ ] `listTransactions(userId, filters)` — supports date range, type, category, pagination (25/page)
  - [ ] `getTransactionById(userId, id)`
  - [ ] `createTransaction(userId, data)` — Zod validated
  - [ ] `updateTransaction(userId, id, data)`
  - [ ] `deleteTransaction(userId, id)`
- [ ] `TransactionSummary` query: total income, total expenses, net for a given period

### 3.2 Transaction pages & components
- [ ] `app/(app)/transactions/page.tsx` — full list with filters
- [ ] `app/(app)/transactions/new/page.tsx` — add income or expense
- [ ] `components/transactions/transaction-list.tsx` — table with skeleton loading
- [ ] `components/transactions/transaction-filters.tsx` — date range, type, category dropdowns
- [ ] `components/transactions/transaction-form.tsx` — shared form for create/edit
- [ ] `components/transactions/transaction-detail-sheet.tsx` — Sheet with full detail + edit/delete
- [ ] Amount display: green for INCOME, red for EXPENSE
- [ ] Date formatted using user locale

### 3.3 Currency utility
- [ ] `lib/currency.ts` with `formatCurrency(amount, currency)` using `Intl.NumberFormat`
- [ ] `SUPPORTED_CURRENCIES` array with code, name, symbol
- [ ] Applied to all monetary displays across the app

### 3.4 Exit criteria
- [ ] User can add, view, edit, and delete transactions
- [ ] Filters and pagination work correctly
- [ ] All amounts display in user's currency (default GHS ₵)
- [ ] `npm run build` passes

---

## Phase 4 — Budget Module

### 4.1 Budget service
- [ ] `lib/services/budgets.ts`:
  - [ ] `listBudgets(userId, month, year)` — returns budgets with spent amounts joined
  - [ ] `getBudgetWithSpend(userId, categoryId, month, year)` — single category budget + actual spend
  - [ ] `upsertBudget(userId, data)` — create or update (unique on userId+categoryId+month+year)
  - [ ] `deleteBudget(userId, id)`
- [ ] Spend calculation: sum of EXPENSE transactions in category for the given month

### 4.2 Budget pages & components
- [ ] `app/(app)/budgets/page.tsx` — grid of category budget cards with month picker
- [ ] `app/(app)/budgets/[id]/page.tsx` — single budget detail with transaction history for that category
- [ ] `components/budgets/budget-card.tsx`:
  - [ ] Category name + Lucide icon
  - [ ] Spent / limit amounts in currency
  - [ ] `Progress` bar — green below 75%, amber 75–99%, red 100%+
  - [ ] "Over Budget" badge when exceeded
- [ ] `components/budgets/budget-form.tsx` — set/edit limit for a category
- [ ] Month/year navigation controls

### 4.3 Exit criteria
- [ ] User can set monthly budget limits per expense category
- [ ] Budget cards show real spend vs limit with correct colour coding
- [ ] Over-budget state is clearly visible
- [ ] `npm run build` passes

---

## Phase 5 — Savings Goals Module

### 5.1 Goals service
- [ ] `lib/services/goals.ts`:
  - [ ] `listGoals(userId)` — all goals with contribution totals
  - [ ] `getGoalById(userId, id)` — with full contribution history
  - [ ] `createGoal(userId, data)` — Zod validated
  - [ ] `updateGoal(userId, id, data)`
  - [ ] `deleteGoal(userId, id)` — cascades contributions
  - [ ] `addContribution(userId, goalId, amount, note?, date)` — atomic: insert GoalContribution + increment Goal.savedAmount in a single transaction
  - [ ] Auto-mark goal as COMPLETED when `savedAmount >= targetAmount`

### 5.2 Goals pages & components
- [ ] `app/(app)/goals/page.tsx` — goals grid
- [ ] `app/(app)/goals/[id]/page.tsx` — goal detail + contribution history
- [ ] `components/goals/goal-card.tsx`:
  - [ ] Goal name + icon
  - [ ] Saved / target amounts
  - [ ] Circular progress ring (SVG, yellow fill on dark/neutral ring)
  - [ ] Deadline countdown ("42 days left") if deadline set
  - [ ] Status badge
- [ ] `components/goals/goal-form.tsx` — create/edit goal
- [ ] `components/goals/contribution-form.tsx` — add contribution (amount, note, date)
- [ ] `components/goals/contribution-list.tsx` — table of past contributions

### 5.3 Exit criteria
- [ ] User can create goals, add contributions, and track progress
- [ ] Goal auto-completes when target is reached
- [ ] Contribution history is accurate
- [ ] `npm run build` passes

---

## Phase 6 — Dashboard Polish

### 6.1 Dashboard service
- [ ] `lib/services/dashboard.ts`:
  - [ ] `getDashboardSummary(userId)` — current month income, expenses, net balance
  - [ ] `getBudgetHealthStrip(userId)` — all budgets for current month with % used
  - [ ] `getTopGoals(userId, limit: 3)` — top 3 active goals with progress
  - [ ] `getRecentTransactions(userId, limit: 8)` — last 8 transactions

### 6.2 Dashboard page & components
- [ ] `app/(app)/dashboard/page.tsx` — full dashboard assembly
- [ ] `components/dashboard/balance-card.tsx` — income / expenses / net for current month
- [ ] `components/dashboard/budget-health-strip.tsx` — horizontal scrollable budget fill bars
- [ ] `components/dashboard/goals-preview.tsx` — top 3 goals with mini progress rings
- [ ] `components/dashboard/recent-transactions.tsx` — last 8 transactions list
- [ ] Floating quick-add button routing to `/transactions/new`
- [ ] All cards use skeleton loading while data fetches

### 6.3 Exit criteria
- [ ] Dashboard loads with real data from DB
- [ ] Correct month scope on all metrics
- [ ] Skeletons render during load, no layout shift
- [ ] `npm run build` passes

---

## Phase 7 — Reports & Charts

### 7.1 Reports service
- [ ] `lib/services/reports.ts`:
  - [ ] `getMonthlySpendByCategory(userId, month, year)` — for bar chart
  - [ ] `getIncomeVsExpensesTrend(userId, months: 6)` — for line chart
  - [ ] `getDailySpend(userId, month, year)` — for heatmap calendar
  - [ ] `getCategoryBreakdown(userId, month, year)` — for donut chart

### 7.2 Reports page & components
- [ ] `app/(app)/reports/page.tsx` — charts page with month/year picker
- [ ] `components/reports/spend-by-category-chart.tsx` — Recharts horizontal bar
- [ ] `components/reports/income-vs-expenses-chart.tsx` — Recharts line chart (6 months)
- [ ] `components/reports/daily-spend-heatmap.tsx` — calendar heat map (custom SVG or grid)
- [ ] `components/reports/category-donut-chart.tsx` — Recharts PieChart
- [ ] All charts use theme-aware colors (yellow primary, semantic status colors)
- [ ] Charts responsive (use `ResponsiveContainer` from Recharts)

### 7.3 Exit criteria
- [ ] All 4 chart types render with real data
- [ ] Month picker navigation works
- [ ] Charts recolour correctly in dark mode
- [ ] `npm run build` passes

---

## Phase 8 — AI Insights Page

### 8.1 Context builder
- [ ] `lib/services/insights.ts`:
  - [ ] `buildInsightsContext(userId)` — aggregates and returns structured summary:
    - Last 3 months of transactions grouped by category + week (totals only, not raw rows)
    - Current month budget statuses (category, limit, spent, % used, over/under)
    - All active savings goals (name, target, saved, % progress, deadline)
    - User name + currency
  - [ ] Context is serialised as a compact JSON string for the system prompt

### 8.2 AI API route
- [ ] `app/api/insights/route.ts`:
  - [ ] POST handler: receives `{ message: string, history: Message[] }`
  - [ ] Calls `buildInsightsContext(userId)` server-side
  - [ ] Sends context as system prompt + user message to `claude-sonnet-4-20250514`
  - [ ] Streams response back to client
  - [ ] `ANTHROPIC_API_KEY` used server-side only — never in client bundle
  - [ ] Auth check: unauthenticated requests return 401

### 8.3 Insights page & components
- [ ] `app/(app)/insights/page.tsx`
- [ ] `components/insights/insights-chat.tsx` — chat interface:
  - [ ] Message list (user + AI messages alternating)
  - [ ] Input field + send button
  - [ ] Streaming response rendered as it arrives
  - [ ] AI messages styled distinctly from user messages
- [ ] `components/insights/prompt-chips.tsx` — preset prompt chips on first load:
  - "Analyse my spending this month"
  - "Where am I overspending?"
  - "Am I on track with my savings goals?"
  - "Predict my expenses for next month"
- [ ] Loading skeleton while context is being built
- [ ] Error state if API call fails

### 8.4 Exit criteria
- [ ] AI responds with grounded, data-specific answers
- [ ] Streaming works (response appears word by word)
- [ ] Preset chips populate the input and trigger a send
- [ ] API key is not visible in browser network tab response or client JS bundle
- [ ] `npm run build` passes

---

## Phase 9 — Settings & Theme

### 9.1 Settings page
- [ ] `app/(app)/settings/page.tsx` with sections:
  - [ ] Profile: update name, email
  - [ ] Password: change password (current + new + confirm)
  - [ ] Currency: searchable dropdown from `SUPPORTED_CURRENCIES`, updates `User.currency`
  - [ ] Appearance: dark/light mode toggle (also accessible from sidebar)
  - [ ] Categories: list + add/rename/delete custom categories
  - [ ] Danger zone: delete account with password confirmation

### 9.2 Theme system
- [ ] `next-themes` `ThemeProvider` wrapping the app in `app/layout.tsx`
- [ ] Dark mode verified on: sidebar, all cards, forms, charts, dialogs, sheets, badges
- [ ] Theme toggle in sidebar footer and settings page both functional
- [ ] No hard-coded hex colors in components — all use CSS variables or Tailwind aliases

### 9.3 Exit criteria
- [ ] Currency change re-renders all monetary values with new symbol
- [ ] Dark mode toggles cleanly with no flash of unstyled content
- [ ] Category delete blocked if transactions exist (with clear error message)
- [ ] Account delete cascades all user data correctly
- [ ] `npm run build` passes

---

## Phase 10 — Quality, Hardening & Polish

### 10.1 Error boundaries & loading UX
- [ ] `app/(app)/error.tsx` — error boundary for protected routes
- [ ] `app/(app)/loading.tsx` — loading UI for protected routes
- [ ] Page-level loading skeletons on all data-heavy pages

### 10.2 Accessibility
- [ ] Visible `:focus-visible` ring styles in `globals.css`
- [ ] `prefers-reduced-motion` media query in `globals.css`
- [ ] All interactive elements keyboard-navigable
- [ ] Form inputs have correct `aria-label` or associated `<label>`

### 10.3 Form validation UX
- [ ] All Zod errors surface as field-level messages (not just toast)
- [ ] Disabled submit button while server action is in flight
- [ ] Success toast + redirect/reset after every successful mutation

### 10.4 Edge cases
- [ ] Zero-state (no transactions) renders empty state, not broken layout
- [ ] Budget with no transactions shows ₵0 spent (not null error)
- [ ] Goal at 100% shows "Completed" badge, contribution form hidden
- [ ] AI Insights page gracefully handles insufficient data (< 1 month of transactions)

### 10.5 Code quality
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run build` passes cleanly
- [ ] No `any` types remaining in codebase
- [ ] All `userId` scoping verified in every service function
- [ ] No `ANTHROPIC_API_KEY` referenced in any client-side file

### 10.6 Final checks
- [ ] Light mode QA pass across all pages
- [ ] Dark mode QA pass across all pages
- [ ] Mobile layout QA (sidebar drawer, stacked cards, bottom CTA)
- [ ] Currency formatting correct for GHS, USD, GBP at minimum
- [ ] Public landing page at `app/page.tsx` (sign in / register CTA, brief value prop)

---

## Notes

- **Do not start Phase 8 (AI Insights) until Phases 3–5 are complete.** The AI context builder depends on transactions, budgets, and goals data existing.
- **Budget and Goal amounts are never converted on currency change.** Currency is a display preference only.
- **All monetary DB fields are `Decimal` — never `Float`.** Enforce this in every schema addition.
- **The AI page is isolated.** Do not embed AI tips or inline suggestions elsewhere in the app — the separation is intentional and keeps the core planner deterministic and trustworthy.