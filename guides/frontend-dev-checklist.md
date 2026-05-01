# Finora — Frontend Developer Checklist

> **Scope:** Everything the user sees and interacts with — design system, global layout, all pages, all components, charts, AI chat UI, accessibility, dark/light mode, and responsive behaviour.
>
> Work through phases **in order**. Do not start Phase N+1 until all exit criteria for Phase N are met.
> Mark tasks `[x]` as they are completed.

---

## Non-Negotiable Rules (Read Before Writing a Single Component)

- [ ] **No emojis as icons.** Lucide React SVG icons only, everywhere.
- [ ] **No hard-coded hex or RGB colors.** All colors come from CSS variables (`var(--color-primary)`) or Tailwind aliases (`bg-primary`, `text-muted`). No exceptions.
- [ ] **Every interactive element** has `cursor-pointer` and a visible hover state with `transition-all duration-200`.
- [ ] **All monetary values** are formatted through `lib/currency.ts → formatCurrency()`. Never raw numbers.
- [ ] **Dark mode** must be verified on every component. Use the `.dark` class strategy — no hard-coded light-only styles.
- [ ] **Never call `alert()` or `confirm()`.** Use shadcn/ui `Dialog` and `Sonner` toasts exclusively.
- [ ] **Never fetch data in Client Components.** Fetch in Server Components and pass as props.
- [ ] **Glassmorphism rules:** Keep backdrop blur subtle (12–18px). Too much blur hurts readability. Yellow never covers large backgrounds.

---

## Design System Reference (Must Internalize)

### Color Identity
| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#FFD100` | Buttons, key actions, active states, highlights |
| `--color-secondary` | `#202020` | Backgrounds, navbar base |
| `--bg-main` | `#fffdf5` / dark: `#141414` | Page background |
| `--bg-card` | `#ffffff` / dark: `#1a1a1a` | Card surfaces |
| `--bg-muted` | `#f7f7f7` / dark: `#202020` | Muted backgrounds |
| `--color-success` | `#22c55e` | Income amounts, success states |
| `--color-error` | `#f04438` | Expense amounts, error states |

### Glassmorphism (Core Visual Language)
```css
/* Standard glass card */
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.15);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);

/* Dark glass (dashboard cards in dark mode) */
background: rgba(32, 32, 32, 0.6);
backdrop-filter: blur(18px);
border: 1px solid rgba(255, 255, 255, 0.08);

/* Tailwind equivalent */
className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl"
```

> In light mode: increase opacity — use `bg-white/80` not `bg-white/10` (too transparent).

### Typography Hierarchy
| Level | Tailwind class |
|---|---|
| Page title | `text-2xl font-bold` |
| Section heading | `text-lg font-semibold` |
| Body | `text-sm` |
| Label / caption | `text-xs text-muted` |

### Spacing (8px grid)
- Card padding: `p-4` (16px) to `p-6` (24px)
- Section gaps: `gap-6` (24px) to `gap-8` (32px)
- Consistent container: `max-w-7xl mx-auto`

### Border Radius
- Cards & modals: `rounded-2xl`
- Inputs & buttons: `rounded-lg`

### Motion
- All transitions: `transition-all duration-200`
- Button hover: `translateY(-1px)` lift
- Modal entry: scale-in fade
- Page transitions: fade + slide

---

## Phase 0 — Design Token Setup

### 0.1 CSS variables
- [x] Full CSS variable set defined in `app/globals.css` — all light mode tokens in `:root`, all dark mode overrides in `.dark`
- [x] Yellow scale (`--color-yellow-1` through `--color-yellow-11`) defined
- [x] Dark scale (`--color-dark-1` through `--color-dark-11`) defined
- [x] Semantic aliases (`--bg-main`, `--bg-card`, `--bg-muted`, `--border-light`, `--text-primary`, `--text-secondary`, `--text-muted`) defined for both modes
- [x] Success, error, and warning colors defined
- [x] Glassmorphism utility classes added to `globals.css`: `.glass`, `.glass-dark`, `.glass-light`

### 0.2 Tailwind config
- [x] `tailwind.config.ts` dark mode strategy set to `class`
- [x] Theme extended with color aliases:
  - `primary.DEFAULT`, `primary.hover`, `primary.active`
  - `bg-main`, `bg-card`, `bg-muted`
  - `text-primary`, `text-secondary`, `text-muted`
  - `border-light`, `border-medium`
- [x] `tailwindcss-animate` plugin added (required by shadcn/ui) — **this repo:** Tailwind v4 + `tw-animate-css` (shadcn v4); no separate `tailwindcss-animate` package
- [x] Base interactive defaults in `globals.css`:
  ```css
  * { cursor: default; }
  button, a, [role="button"] { cursor: pointer; transition: all 0.2s ease; }
  ```

### 0.3 shadcn/ui initialised
- [x] `npx shadcn@latest init` run
- [x] Base components installed:
  - [x] `button`
  - [x] `card`
  - [x] `input`
  - [x] `label`
  - [x] `badge`
  - [x] `dialog`
  - [x] `sheet`
  - [x] `table`
  - [x] `progress`
  - [x] `select`
  - [x] `dropdown-menu`
  - [x] `avatar`
  - [x] `separator`
  - [x] `skeleton`
  - [x] `tabs`
  - [x] `tooltip`
- [x] `next-themes` installed for theme persistence

### 0.4 Exit criteria
- [x] `npm run build` passes on clean scaffold
- [x] Dark mode toggle works (`.dark` class applied on `<html>`)
- [x] CSS variables resolve correctly in both modes (verify in browser dev tools)

---

## Phase 1 — Auth Pages

### 1.1 Login page (`app/(auth)/login/page.tsx`)
- [x] `components/auth/login-form.tsx` — glass card form:
  - [x] Email input with label
  - [x] Password input with show/hide toggle (Lucide `Eye`/`EyeOff`)
  - [x] Primary yellow submit button
  - [x] Link to `/register`
  - [x] Zod field-level error messages displayed inline
  - [x] Submit button disabled while in-flight
  - [x] Sonner toast on success (then redirect) and on error
  - [ ] **"Forgot password?" link** below the password field → `/forgot-password`
- [x] Centered layout — full viewport height, vertical + horizontal centering
- [x] Finora logo/wordmark at top

### 1.2 Register page (`app/(auth)/register/page.tsx`)
- [x] Same glass card pattern as login
- [x] Fields: `name`, `email`, `password`, `confirmPassword`
- [x] Password confirmation validated client-side before submit
- [x] Link back to `/login`
- [ ] **Post-submit redirect:** API response now includes `requiresEmailVerification: true` — redirect to `/verify-email` instead of `/dashboard` or `/onboarding`

### 1.3 Email verification page (`app/(auth)/verify-email/page.tsx`)

> **Backend contracts (both routes are session-gated — user must be signed in):**
> - `POST /api/auth/verify-email` — body `{ otp: string }`; returns `{ verified: true }` or `{ error: string }`
> - `POST /api/auth/resend-otp` — no body; returns `{ message: string }` or `{ error: string }`; 60-second cooldown enforced server-side

- [ ] Glass card layout — same pattern as login/register pages
- [ ] Heading: "Verify your email" + subtitle with the user's masked email address and "we sent a 6-digit code"
- [ ] 6-digit OTP input — single `<input maxLength={6}>` or 6 individual digit boxes with auto-advance
- [ ] "Verify" submit button — disabled while in-flight; spinner on submit
- [ ] Inline error display for wrong code, expired code, or server errors
- [ ] **"Resend code" button** — disabled for 60 seconds after the last send; shows a live countdown ("Resend in 42s"); enabled again after cooldown
- [ ] On success (`{ verified: true }`): force a session token refresh (NextAuth `update()` from `useSession`), then redirect to `/onboarding`
- [ ] Accessible from middleware redirect if a signed-in user has `isEmailVerified: false` (see 1.6)

### 1.4 Forgot password page (`app/(auth)/forgot-password/page.tsx`)

> **Backend contract:** `POST /api/auth/forgot-password` — public (no session needed); body `{ email: string }`; **always returns 200** with a generic message regardless of whether the email exists (prevents enumeration)

- [ ] Glass card layout
- [ ] Heading: "Forgot your password?" + subtitle
- [ ] Email input with label + inline validation
- [ ] Submit button — disabled while in-flight; spinner on submit
- [ ] **After submission:** replace the form with a success state — e.g. envelope icon + "Check your inbox. If that email is registered, a reset link has been sent." — always shown, never reveals whether the email exists
- [ ] "Back to sign in" link → `/login`

### 1.5 Reset password page (`app/(auth)/reset-password/page.tsx`)

> **Backend contracts:**
> - `GET /api/auth/reset-password?token=<raw>` — public; validates token before showing the form; returns `{ valid: true }` or `{ error: string }`
> - `POST /api/auth/reset-password` — public; body `{ token: string, newPassword: string, confirmPassword: string }`; returns `{ success: true }` or `{ error: string }`

- [ ] On page mount: call `GET /api/auth/reset-password?token=<urlParam>` to validate the token
  - [ ] If invalid or expired: show error card — "This reset link is invalid or has expired" + "Request a new link" button → `/forgot-password`
  - [ ] If valid: render the new-password form
- [ ] Form fields: new password + confirm new password — both with show/hide toggles
- [ ] `token` value passed as hidden field (or included in the submit payload from state)
- [ ] Submit button disabled while in-flight + inline field errors
- [ ] On success: Sonner toast "Password updated — please sign in" → redirect to `/login`
- [ ] On error (e.g. link consumed in another tab): show inline error + "Request a new link" button

### 1.6 Middleware gate for unverified users

> **Backend note:** `session.user.isEmailVerified` (boolean) is present in every authenticated JWT. `proxy.ts` currently does **not** gate on this field — that's a deliberate hold pending this task.

- [ ] Update `proxy.ts`: if the session exists **and** `session.user.isEmailVerified === false`, redirect to `/verify-email` unless the current path is already `/verify-email`
- [ ] Ensure `/verify-email` is in the middleware's allowed-through list so it doesn't redirect-loop
- [ ] Verify that public auth routes (`/login`, `/register`, `/forgot-password`, `/reset-password`) are also excluded from the gate

### 1.7 Exit criteria
- [x] Login and register forms render correctly in light and dark mode
- [x] Field errors appear inline (not just a toast)
- [x] Submit button shows a loading state while waiting
- [ ] Register → redirects to `/verify-email`; OTP entry works end-to-end
- [ ] "Forgot password?" link visible on login page
- [ ] Full reset flow works: email → inbox → link → new password → login
- [ ] Unverified user who signs in is intercepted by middleware and lands on `/verify-email`

---

## Phase 2 — App Shell ✅

### 2.1 Sidebar (`components/shared/sidebar.tsx`)
- [x] Finora wordmark at top
- [x] All 7 navigation links with Lucide icons (LayoutDashboard, ArrowLeftRight, Wallet, Target, BarChart2, Sparkles, Settings)
- [x] Active state: yellow left bar + yellow text + `bg-primary/10` background
- [x] Collapsible to icon-only on desktop (ChevronLeft/Right toggle)
- [x] Mobile: Sheet drawer with hamburger button
- [x] Dark/light mode toggle in sidebar footer (Sun/Moon icons)
- [x] User avatar (initials) + name/email + sign-out button at footer

### 2.2 Protected layout (`app/(app)/layout.tsx`)
- [x] Server component: fetches session, renders `AppSidebar`
- [x] `h-screen overflow-hidden` outer div; `main` is `overflow-y-auto flex-1`
- [x] Desktop sidebar fixed; mobile hamburger triggers Sheet drawer

### 2.3 Shared utility components
- [x] `components/shared/empty-state.tsx` — icon + title + description + action slot
- [x] `components/shared/loading-state.tsx` — `TableLoadingState`, `CardGridLoadingState`, `StatCardLoadingState`
- [x] `components/shared/page-header.tsx` — title + description + optional action slot

### 2.4 Exit criteria
- [x] Sidebar renders in light and dark mode with correct active states
- [x] Collapsible works on desktop; Sheet drawer works on mobile
- [x] Theme toggle in sidebar footer; removed floating root-layout ThemeToggle

---

## Phase 3 — Transactions Pages & Components ✅

### 3.1 Transaction list page (`app/(app)/transactions/page.tsx`)
- [x] Server component — parallel fetch (transactions + categories), serialises Decimal to string
- [x] Pagination via URL `?page=N` search param

### 3.2 Transaction filters
- [ ] (Deferred to polish phase — URL-param filters)

### 3.3 Transaction list (`components/transactions/transaction-list.tsx`)
- [x] shadcn `Table` with Date, Category+type badge, Note, Amount columns
- [x] Green `text-[var(--color-success)]` for INCOME, red for EXPENSE
- [x] `Intl.DateTimeFormat` for date display
- [x] Pagination Previous/Next with page count
- [x] Row click opens edit Sheet; trash icon opens delete Dialog

### 3.4 + 3.5 Transaction forms (`components/transactions/transaction-form.tsx`)
- [x] Shared for create/edit; type toggle (INCOME/EXPENSE), amount (with currency symbol prefix), category select, date, note, recurrence
- [x] Zod field-level error messages inline
- [x] Submit disabled + spinner while in-flight
- [x] Sonner toast on success/error

### 3.6 Add transaction page (`app/(app)/transactions/new/page.tsx`)
- [x] Server component — fetches categories, renders `TransactionForm` in create mode

### 3.7 Server actions (`lib/actions/transactions.ts`)
- [x] `createTransactionAction`, `updateTransactionAction`, `deleteTransactionAction` — each auth-checks and revalidates `/transactions`

### 3.8 Exit criteria
- [x] Full CRUD works
- [x] Green/red amount colours correct
- [x] Pagination works
- [x] `npm run build` passes cleanly

---

## Phase 4 — Budgets Pages & Components ✅

### 4.1 Budgets page (`app/(app)/budgets/page.tsx`)
- [x] Server component — fetches `listBudgets(month, year)` + expense categories; passes to `BudgetsClient`
- [x] Month/year from URL `?month=&year=` params; defaults to current month

### 4.2 Budget card (`components/budgets/budget-card.tsx`)
- [x] Category name, spent/limit with `formatCurrency()`
- [x] shadcn `Progress` bar: green < 75%, amber ≥ 75%, red on over-budget
- [x] "Over budget" `Badge` when exceeded
- [x] Glass card with hover lift, click triggers edit dialog

### 4.3 Budget form (`components/budgets/budget-form.tsx`)
- [x] Category select (EXPENSE only) + amount with currency symbol
- [x] Used in Dialog for create/edit
- [x] Zod validation inline

### 4.4 Budgets client (`components/budgets/budgets-client.tsx`)
- [x] Month navigation via `router.push` with updated params
- [x] Empty state with CTA when no budgets set

### 4.5 Server actions (`lib/actions/budgets.ts`)
- [x] `upsertBudgetAction`, `deleteBudgetAction`

### 4.6 Exit criteria
- [x] Progress bar colours correct at all thresholds
- [x] Over-budget badge appears
- [x] Month navigation reloads data
- [x] `npm run build` passes

---

## Phase 5 — Goals Pages & Components ✅

### 5.1 Goals page (`app/(app)/goals/page.tsx`)
- [x] Server component — fetches `listGoals(userId)`, serialises Decimal + computes daysLeft
- [x] Renders `GoalsClient`

### 5.2 Goal card (`components/goals/goal-card.tsx`)
- [x] Custom SVG circular progress ring — yellow `text-primary` fill on neutral track
- [x] Percentage label centred inside ring
- [x] Status Badge: yellow (Active), green (Completed), grey (Paused)
- [x] Deadline countdown: "42d left", "Due today", "3d overdue" with colour coding
- [x] Saved/target amounts via `formatCurrency()`
- [x] Glass card with hover lift; delete button visible on hover

### 5.3 Goal form (`components/goals/goal-form.tsx`)
- [x] Name, target amount (with symbol prefix), optional deadline
- [x] Zod validation inline

### 5.4 Goals client (`components/goals/goals-client.tsx`)
- [x] New goal Dialog; refresh on success; empty state CTA

### 5.5 Server actions (`lib/actions/goals.ts`)
- [x] `createGoalAction`, `updateGoalAction`, `deleteGoalAction`, `addContributionAction`

> **Note:** Goal detail page + contribution form (§5.4–5.5) is the next sub-phase.

### 5.6 Exit criteria
- [x] Ring fills correctly relative to percentage
- [x] Status badge and deadline countdown display correctly
- [x] `npm run build` passes

---

## Phase 6 — Dashboard Page & Components ✅

### 6.1 Dashboard page (`app/(app)/dashboard/page.tsx`)
- [x] Server component — `Promise.all` parallel fetch for all 4 queries
- [x] All Decimal values serialised to formatted strings before passing as props
- [x] Personalised greeting ("Good morning, [first name]")
- [x] FAB: mobile = round `Plus` button; desktop = pill "Add transaction" button (fixed bottom-right)

### 6.2 Balance card (`components/dashboard/balance-card.tsx`)
- [x] 3-column: Income (green), Expenses (red), Net (success if ≥ 0 else error)
- [x] Month/year label + Wallet icon
- [x] Glass card; pulse skeleton variant

### 6.3 Budget health strip (`components/dashboard/budget-health-strip.tsx`)
- [x] Horizontally scrollable row; green/amber/red Progress bars per threshold
- [x] spent/limit labels, "Over budget" mini-badge
- [x] Empty state with CTA; "View all budgets" link

### 6.4 Goals preview (`components/dashboard/goals-preview.tsx`)
- [x] Mini SVG circular rings (48px); percentage + saved/target amounts
- [x] Empty state with CTA; "View all goals" link

### 6.5 Recent transactions (`components/dashboard/recent-transactions.tsx`)
- [x] Last 8 rows: type pill (+/-), category, note/date, coloured amount
- [x] Empty state with CTA; "View all transactions" link

### 6.6 Exit criteria
- [x] All 4 sections load with real data
- [x] FAB navigates to `/transactions/new`
- [x] `npm run build` passes

---

## Phase 7 — Reports Page & Charts

### 7.1 Reports page (`app/(app)/reports/page.tsx`)
- [x] Month/year picker at top
- [x] 4 chart sections in a 2×2 grid (stacked on mobile)
- [x] All charts use theme-aware colors via CSS variables
- [x] All charts wrapped in `ResponsiveContainer` from Recharts

### 7.2 Spend by category chart (`components/reports/spend-by-category-chart.tsx`)
- [x] Recharts `BarChart` — horizontal bars
- [x] Category names on Y axis, spend amounts on X axis
- [x] Bar fill: `var(--color-primary)` with 80% opacity
- [x] Custom `Tooltip` using glass styling

### 7.3 Income vs Expenses trend (`components/reports/income-vs-expenses-chart.tsx`)
- [x] Recharts `LineChart` — last 6 months
- [x] Income line: green; Expenses line: red
- [x] X axis: month labels; Y axis: currency amounts
- [x] Legend below chart

### 7.4 Daily spend heatmap (`components/reports/daily-spend-heatmap.tsx`)
- [x] Calendar-style grid for the current month
- [x] Each day cell: background intensity = spend amount (low → `--color-yellow-2`, high → `--color-yellow-6`)
- [x] Tooltip on hover showing day + amount
- [x] Days with no spend: neutral `--bg-muted`

### 7.5 Category donut chart (`components/reports/category-donut-chart.tsx`)
- [x] Recharts `PieChart` in donut mode (`innerRadius`)
- [x] Each slice: category color or a sequential palette from `--color-yellow-*` scale
- [x] Centered label: total spend for the month
- [x] Legend with category names + amounts

### 7.6 Exit criteria
- [x] All 4 charts render with real data
- [x] Charts recolour correctly in dark mode
- [x] Month picker updates all charts
- [x] No horizontal overflow on mobile
- [x] `npm run build` passes

---

## Phase 8 — AI Insights Page & Chat UI

> **Backend contract:** `POST /api/insights` — body `{ message: string, history: { role: "user" | "assistant", content: string }[] }`. Response: `text/event-stream`. Each SSE event is `data: <JSON-encoded text chunk>\n\n`. Stream ends with `data: [DONE]\n\n`. Unauthenticated → `401`. Powered by `gemini-2.5-flash` via `@google/genai` (server-side only — key never in client bundle).

### How to consume the stream (client-side pattern)
```ts
const res = await fetch("/api/insights", { method: "POST", body: JSON.stringify({ message, history }) })
const reader = res.body!.getReader()
const decoder = new TextDecoder()
let buffer = ""
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split("\n\n")
  buffer = lines.pop() ?? ""
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue
    const payload = line.slice(6)
    if (payload === "[DONE]") return
    setAiText(prev => prev + JSON.parse(payload))  // JSON.parse unwraps the string
  }
}
```

### 8.1 Insights page (`app/(app)/insights/page.tsx`)
- [x] Full-height layout — sidebar + chat area fills viewport
- [x] Shows `insights-chat.tsx` and `prompt-chips.tsx`
- [x] No server-side data fetch needed — context is built inside the API route on each POST

### 8.2 Chat interface (`components/insights/insights-chat.tsx`)
- [x] Client Component (`"use client"`) — manages message state and stream reading
- [x] Scrollable message list — user messages right-aligned, AI messages left-aligned
- [x] User message bubble: `bg-primary text-secondary` (yellow on dark)
- [x] AI message bubble: glass card styling
- [x] Streaming response: reads `text/event-stream`, parses `data: <json>` lines, appends `JSON.parse(payload)` to the current AI message in real time
- [x] Animated "thinking" indicator while waiting for first token (pulsing dots)
- [x] Input field pinned to bottom with send button (`Send` Lucide icon)
- [x] Input clears and send disabled while response is streaming
- [x] Error state if stream fails (`res.ok === false`) — Sonner toast + retry option

### 8.3 Prompt chips (`components/insights/prompt-chips.tsx`)
- [x] 4 preset chips visible on first load (before any message is sent):
  - "Analyse my spending this month"
  - "Where am I overspending?"
  - "Am I on track with my savings goals?"
  - "Predict my expenses for next month"
- [x] Clicking a chip populates the input and auto-sends
- [x] Chips hidden once first message is sent

### 8.4 Exit criteria
- [x] Streaming renders progressively (visible word-by-word)
- [x] Preset chips auto-send correctly
- [x] `GEMINI_API_KEY` is not visible in network tab response or browser JS bundle
- [x] Error state renders cleanly
- [x] `npm run build` passes

---

## Phase 9 — Settings Page

> **All server actions are fully built.** Import from `lib/actions/settings.ts`: `updateProfileAction`, `changePasswordAction`, `updateCurrencyAction`, `deleteAccountAction`. Import category actions from `lib/actions/categories.ts` (already exists from Phase 3). All return `{ data } | { error: string }`.

### 9.1 Settings page (`app/(app)/settings/page.tsx`)
- [x] Tabbed or sectioned layout with these sections:

**Profile**
- [x] Name and email fields pre-populated from session
- [x] Calls `updateProfileAction({ name, email })` on save
- [x] Inline field errors + Sonner toast on success/failure
- [x] If email changes: note to user that their inbox may need re-verification (informational only — no forced re-verification currently)

**Password**
- [x] Current password + new password + confirm new password inputs — all with show/hide toggles
- [x] Calls `changePasswordAction({ currentPassword, newPassword, confirmPassword })`
- [x] Inline field errors (wrong current password shows on that field) + Sonner toast
- [x] Clears all fields on success

**Currency**
- [x] Searchable `Select` (shadcn/ui `Combobox` pattern) populated from `SUPPORTED_CURRENCIES` (`lib/currency.ts`)
- [x] Calls `updateCurrencyAction({ currency })` on change
- [x] Current currency pre-selected from session
- [x] On success: revalidation fires automatically (server action calls `revalidatePath` for all data pages)

**Appearance**
- [x] Dark/light mode toggle (mirrors sidebar toggle)
- [x] Lucide `Sun`/`Moon` icons — no text labels

**Categories**
- [x] List of user's categories with type badge (Income / Expense)
- [x] Inline rename with edit icon — calls `updateCategoryAction`
- [x] Delete icon — shows `Dialog` confirmation; calls `deleteCategoryAction`; blocked if transactions exist (shows inline error from server action)
- [x] "Add Category" form — calls `createCategoryAction`

**Danger Zone**
- [x] Delete account section with red warning styling
- [x] Requires password confirmation in a shadcn `Dialog`
- [x] Calls `deleteAccountAction({ password })`
- [x] On success: calls `signOut()` from `next-auth/react` → redirects to `/login`

### 9.2 Theme system verification
- [x] `next-themes` `ThemeProvider` wraps the app in `app/layout.tsx`
- [x] No flash of unstyled content on page load (`suppressHydrationWarning` on `<html>`)
- [x] Dark mode verified across: sidebar, all cards, forms, charts, dialogs, sheets, badges, inputs

### 9.3 Exit criteria
- [x] Currency change re-renders all monetary values with correct symbol
- [x] Dark/light toggle in settings and sidebar both update the same theme state
- [x] Category delete blocked with clear error if transactions exist
- [x] Account deletion redirects to `/login`

---

## Phase 10 — Onboarding Flow

### 10.1 Onboarding page (`app/(app)/onboarding/page.tsx`)
- [ ] Only shown to new users with zero categories
- [ ] Step 1: Welcome screen with Finora branding + value prop
- [ ] Step 2: Confirms default categories being seeded (shows list)
- [ ] Step 3 (optional): Prompt for first income entry
- [ ] "Get Started" / "Skip" on optional step → redirect to `/dashboard`
- [ ] Glass card layout, yellow CTA buttons

### 10.2 Redirect logic
- [ ] After login, check if `categories.length === 0` → redirect to `/onboarding`
- [ ] Returning user with categories → straight to `/dashboard`

### 10.3 Exit criteria
- [ ] New user sees onboarding and categories are seeded
- [ ] Returning user bypasses onboarding
- [ ] Skip button works

---

## Phase 11 — Public Landing Page

### 11.1 Landing page (`app/page.tsx`)
- [ ] Above the fold: Finora logo + one-line value prop + "Sign In" + "Get Started" CTAs
- [ ] Feature highlights (3–4 cards): Budget tracking, Savings goals, AI insights, Reports
- [ ] Clean, professional — yellow primary accents on light/dark background
- [ ] No auth required

### 11.2 Exit criteria
- [ ] Renders with no session required
- [ ] "Get Started" → `/register`; "Sign In" → `/login`

---

## Phase 12 — Quality, Accessibility & Polish

### 12.1 Error & loading boundaries
- [ ] `app/(app)/error.tsx` — error boundary for protected routes (glass card + "Something went wrong" + retry button)
- [ ] `app/(app)/loading.tsx` — loading UI for protected routes
- [ ] All data-heavy pages have page-level skeleton loading states

### 12.2 Accessibility
- [ ] Visible `:focus-visible` ring styles in `globals.css` (`outline: 2px solid var(--color-primary)`)
- [ ] `prefers-reduced-motion` media query disables transitions/animations in `globals.css`
- [ ] All interactive elements keyboard-navigable (Tab + Enter/Space)
- [ ] All form inputs have associated `<label>` elements or `aria-label`
- [ ] Color is never the only indicator (add icons or text labels alongside color meaning)
- [ ] All images and chart visuals have `alt` text

### 12.3 Form UX
- [ ] All Zod validation errors appear as field-level messages — not only as toasts
- [ ] Submit buttons disabled while server action is in-flight (loading spinner icon)
- [ ] Success: Sonner toast + redirect or form reset
- [ ] Error: Sonner toast + field errors remain visible

### 12.4 Edge cases & zero states
- [ ] No transactions → `empty-state.tsx` renders instead of empty table
- [ ] Budget with no transactions → shows "₵0 / ₵500" (not null error)
- [ ] Goal at 100% → "Completed" badge visible, contribution form hidden
- [ ] AI Insights with < 1 month data → AI responds with a clear "insufficient data" message (no crash)
- [ ] Reports month with no data → charts show zero lines / empty state
- [ ] OTP expired (15 min) → inline error "Code expired — please request a new one" with "Resend code" button highlighted
- [ ] OTP wrong → inline error "Incorrect code. Please try again" (not a toast — stays visible)
- [ ] Resend cooldown active → "Resend code" button disabled with live countdown; shows `{ error }` message if cooldown triggered via API
- [ ] Reset link expired (1 hour) → `/reset-password` page shows error state with "Get a new link" → `/forgot-password`
- [ ] Reset link already consumed → same expired error state (backend returns identical error message — no information leakage)

### 12.5 Responsive layout audit
- [ ] **375px (mobile):** Sidebar hidden → drawer/bottom-nav active; cards stack to single column; no horizontal scroll
- [ ] **768px (tablet):** Sidebar icon-only; 2-column card grids
- [ ] **1024px (desktop):** Full sidebar; multi-column layouts
- [ ] **1440px (wide):** Max-width container; no stretched layouts

### 12.6 Pre-delivery visual QA checklist
- [ ] Light mode QA pass across all pages
- [ ] Dark mode QA pass across all pages
- [ ] Mobile layout QA (375px viewport)
- [ ] No broken glass card contrast in light mode (use `bg-white/80` minimum in light)
- [ ] All Lucide icons consistent in size (`w-5 h-5` default, `w-4 h-4` small)
- [ ] Currency formatting correct for GHS (₵), USD ($), GBP (£) at minimum
- [ ] All hover states produce visible feedback
- [ ] All loading skeletons match the shape of the content they replace (no layout shift)

### 12.7 Code quality
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — clean, no TypeScript errors
- [ ] No `any` types in component props or hooks
- [ ] No hard-coded hex values in any `.tsx` or `.css` file — all via CSS variables or Tailwind aliases

---

## Component Patterns Reference

### Glass Card (copy this pattern)
```tsx
<div className="backdrop-blur-[16px] bg-white/[0.08] dark:bg-[rgba(32,32,32,0.6)] border border-white/[0.15] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
  {children}
</div>
```

### Primary Button
```tsx
<Button className="bg-primary text-secondary font-semibold rounded-lg hover:-translate-y-px transition-all duration-200">
  Action
</Button>
```

### Amount Display
```tsx
<span className={cn("font-semibold tabular-nums", type === "INCOME" ? "text-success" : "text-error")}>
  {formatCurrency(amount, currency)}
</span>
```

### Skeleton Loading
```tsx
<Skeleton className="h-4 w-32 rounded bg-bg-muted" />
```

### Inline Field Error
```tsx
{errors.fieldName && (
  <p className="text-xs text-error mt-1">{errors.fieldName.message}</p>
)}
```

---

## Notes

- **Stick to the stack.** shadcn/ui components first. Only build custom if shadcn cannot do it.
- **Glassmorphism is a texture, not a replacement for color.** Every glass element still needs sufficient contrast.
- **The AI Insights page is isolated.** No inline AI tips or suggestions anywhere else in the app.
- **AI provider is Gemini 2.5 Flash** (`gemini-2.5-flash` via `@google/genai`). `GEMINI_API_KEY` is server-side only. Never import `@google/genai` in a Client Component or any file under `app/(app)/`.
- **Never convert stored amounts on currency change.** Currency is display-only.
- **The design system guide (`guides/finora_design_system_glassmorphism_ai_ui_ux.md`) is the visual bible.** Consult it before making any stylistic decision.
- **Email verification is required for all new accounts.** The register API returns `requiresEmailVerification: true` — always redirect to `/verify-email`. Session will have `isEmailVerified: false` until the OTP is confirmed; force a token refresh with NextAuth's `update()` after successful verification.
- **Session JWT refresh after OTP verification.** The JWT does not auto-refresh. After `POST /api/auth/verify-email` returns `{ verified: true }`, call `update()` from `useSession()` (NextAuth v5) to force the JWT to re-read from the DB, which will now return `isEmailVerified: true`.
- **Settings server actions are all built.** `updateProfileAction`, `changePasswordAction`, `updateCurrencyAction`, `deleteAccountAction` all live in `lib/actions/settings.ts`. Import and call directly — no need to hit API routes.
- **Password reset pages live in `app/(auth)/`** (unauthenticated routes), not `app/(app)/`. Ensure `proxy.ts` does not redirect these to `/login`.
