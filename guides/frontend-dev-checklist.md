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
- [ ] Full CSS variable set defined in `app/globals.css` — all light mode tokens in `:root`, all dark mode overrides in `.dark`
- [ ] Yellow scale (`--color-yellow-1` through `--color-yellow-11`) defined
- [ ] Dark scale (`--color-dark-1` through `--color-dark-11`) defined
- [ ] Semantic aliases (`--bg-main`, `--bg-card`, `--bg-muted`, `--border-light`, `--text-primary`, `--text-secondary`, `--text-muted`) defined for both modes
- [ ] Success, error, and warning colors defined
- [ ] Glassmorphism utility classes added to `globals.css`: `.glass`, `.glass-dark`, `.glass-light`

### 0.2 Tailwind config
- [ ] `tailwind.config.ts` dark mode strategy set to `class`
- [ ] Theme extended with color aliases:
  - `primary.DEFAULT`, `primary.hover`, `primary.active`
  - `bg-main`, `bg-card`, `bg-muted`
  - `text-primary`, `text-secondary`, `text-muted`
  - `border-light`, `border-medium`
- [ ] `tailwindcss-animate` plugin added (required by shadcn/ui)
- [ ] Base interactive defaults in `globals.css`:
  ```css
  * { cursor: default; }
  button, a, [role="button"] { cursor: pointer; transition: all 0.2s ease; }
  ```

### 0.3 shadcn/ui initialised
- [ ] `npx shadcn@latest init` run
- [ ] Base components installed:
  - [ ] `button`
  - [ ] `card`
  - [ ] `input`
  - [ ] `label`
  - [ ] `badge`
  - [ ] `dialog`
  - [ ] `sheet`
  - [ ] `table`
  - [ ] `progress`
  - [ ] `select`
  - [ ] `dropdown-menu`
  - [ ] `avatar`
  - [ ] `separator`
  - [ ] `skeleton`
  - [ ] `tabs`
  - [ ] `tooltip`
- [ ] `next-themes` installed for theme persistence

### 0.4 Exit criteria
- [ ] `npm run build` passes on clean scaffold
- [ ] Dark mode toggle works (`.dark` class applied on `<html>`)
- [ ] CSS variables resolve correctly in both modes (verify in browser dev tools)

---

## Phase 1 — Auth Pages

### 1.1 Login page (`app/(auth)/login/page.tsx`)
- [ ] `components/auth/login-form.tsx` — glass card form:
  - [ ] Email input with label
  - [ ] Password input with show/hide toggle (Lucide `Eye`/`EyeOff`)
  - [ ] Primary yellow submit button
  - [ ] Link to `/register`
  - [ ] Zod field-level error messages displayed inline
  - [ ] Submit button disabled while in-flight
  - [ ] Sonner toast on success (then redirect) and on error
- [ ] Centered layout — full viewport height, vertical + horizontal centering
- [ ] Finora logo/wordmark at top

### 1.2 Register page (`app/(auth)/register/page.tsx`)
- [ ] Same glass card pattern as login
- [ ] Fields: `name`, `email`, `password`, `confirmPassword`
- [ ] Password confirmation validated client-side before submit
- [ ] Link back to `/login`

### 1.3 Exit criteria
- [ ] Login and register forms render correctly in light and dark mode
- [ ] Field errors appear inline (not just a toast)
- [ ] Submit button shows a loading state while waiting

---

## Phase 2 — App Shell

### 2.1 Sidebar (`components/shared/sidebar.tsx`)
- [ ] Finora wordmark + logo at top
- [ ] Navigation links with Lucide icons:
  - Dashboard → `LayoutDashboard`
  - Transactions → `ArrowLeftRight`
  - Budgets → `Wallet`
  - Goals → `Target`
  - Reports → `BarChart2`
  - Insights → `Sparkles`
  - Settings → `Settings`
- [ ] Active state: yellow left border (`border-l-2 border-primary`) + yellow text + subtle yellow-tinted background
- [ ] Collapsible to icon-only on desktop (toggle with a `ChevronLeft`/`ChevronRight` icon)
- [ ] Mobile: bottom sheet/drawer (shadcn/ui `Sheet`)
- [ ] Dark/light mode toggle in sidebar footer (Lucide `Sun`/`Moon` — no text labels)
- [ ] User avatar + name at footer (shadcn/ui `Avatar`)

### 2.2 Protected layout (`app/(app)/layout.tsx`)
- [ ] Imports and renders sidebar
- [ ] Main content area scrollable, sidebar fixed
- [ ] Handles mobile layout: sidebar hidden, bottom nav or hamburger visible

### 2.3 Shared utility components
- [ ] `components/shared/empty-state.tsx` — centered illustration + message for zero-data states
- [ ] `components/shared/loading-state.tsx` — skeleton placeholder matching page layout
- [ ] `components/shared/page-header.tsx` — page title + optional action button slot

### 2.4 Exit criteria
- [ ] Sidebar renders in light and dark mode with correct active states
- [ ] Collapsible works on desktop; drawer works on mobile
- [ ] Theme toggle persists across page navigations

---

## Phase 3 — Transactions Pages & Components

### 3.1 Transaction list page (`app/(app)/transactions/page.tsx`)
- [ ] Server component — fetches data, passes to client components as props
- [ ] Uses `components/transactions/transaction-filters.tsx` and `transaction-list.tsx`

### 3.2 Transaction filters (`components/transactions/transaction-filters.tsx`)
- [ ] Date range picker (start date / end date inputs)
- [ ] Type filter: `All`, `Income`, `Expense` (shadcn `Tabs` or `Select`)
- [ ] Category filter: `Select` populated from categories prop
- [ ] Filters update URL search params; page re-fetches on change

### 3.3 Transaction list (`components/transactions/transaction-list.tsx`)
- [ ] shadcn/ui `Table` with columns: Date, Category (icon + name), Note (truncated), Amount
- [ ] Amount: green text for INCOME (`text-success`), red for EXPENSE (`text-error`)
- [ ] Date formatted with user locale (`Intl.DateTimeFormat`)
- [ ] Skeleton rows during loading (shadcn `Skeleton`)
- [ ] Pagination controls — "Previous / Next", shows current page and total
- [ ] Clicking a row opens `transaction-detail-sheet.tsx`

### 3.4 Transaction detail sheet (`components/transactions/transaction-detail-sheet.tsx`)
- [ ] shadcn/ui `Sheet` from the right
- [ ] Displays full transaction details
- [ ] Edit button — loads `transaction-form.tsx` in edit mode
- [ ] Delete button with confirmation `Dialog` before deletion
- [ ] Sonner toast on successful edit/delete

### 3.5 Transaction form (`components/transactions/transaction-form.tsx`)
- [ ] Shared for create and edit
- [ ] Fields: Type (radio/tabs), Amount (numeric), Category (select), Date (date input), Note (optional text), Recurrence (select)
- [ ] Zod field-level error messages below each input
- [ ] Amount input formatted as currency symbol prefix
- [ ] Submit disabled while in-flight

### 3.6 Add transaction page (`app/(app)/transactions/new/page.tsx`)
- [ ] Uses `transaction-form.tsx` in create mode
- [ ] On success: Sonner toast + redirect to `/transactions`

### 3.7 Exit criteria
- [ ] Full CRUD works: create, view, edit, delete
- [ ] Green/red amount colours correct
- [ ] Filters and pagination work
- [ ] Skeleton loading shown during data fetch
- [ ] `npm run build` passes

---

## Phase 4 — Budgets Pages & Components

### 4.1 Budgets page (`app/(app)/budgets/page.tsx`)
- [ ] Month/year navigation controls (prev/next arrows + current month display)
- [ ] Grid of `budget-card.tsx` components
- [ ] "Set budget" button for categories with no limit

### 4.2 Budget card (`components/budgets/budget-card.tsx`)
- [ ] Category name + Lucide icon
- [ ] Spent / limit amounts using `formatCurrency()`
- [ ] shadcn/ui `Progress` bar:
  - Green (`bg-success`) when < 75% used
  - Amber (`bg-warning`) when 75–99%
  - Red (`bg-error`) when 100%+
- [ ] "Over Budget" red `Badge` when exceeded
- [ ] Glass card styling with hover glow effect
- [ ] Click → navigates to `/budgets/[id]`

### 4.3 Budget form (`components/budgets/budget-form.tsx`)
- [ ] Category select + amount input
- [ ] Used in a `Dialog` (create) and inline on detail page (edit)
- [ ] Zod field-level validation

### 4.4 Budget detail page (`app/(app)/budgets/[id]/page.tsx`)
- [ ] Budget card at top with current spend
- [ ] Transaction history for that category in the selected month (table)

### 4.5 Exit criteria
- [ ] Correct progress bar colours at all thresholds
- [ ] "Over Budget" badge appears when spend > limit
- [ ] Month navigation updates all cards
- [ ] `npm run build` passes

---

## Phase 5 — Goals Pages & Components

### 5.1 Goals page (`app/(app)/goals/page.tsx`)
- [ ] Grid of `goal-card.tsx` components
- [ ] "New Goal" button → opens `goal-form.tsx` in `Dialog`

### 5.2 Goal card (`components/goals/goal-card.tsx`)
- [ ] Goal name + Lucide icon
- [ ] Saved / target amounts using `formatCurrency()`
- [ ] **Circular progress ring** — custom SVG:
  - Yellow fill (`stroke: var(--color-primary)`) on dark neutral ring
  - Percentage label centered inside
- [ ] Deadline countdown: "42 days left" or "Overdue" if past deadline
- [ ] Status `Badge`: Active (yellow), Completed (green), Paused (grey)
- [ ] Glass card styling

### 5.3 Goal form (`components/goals/goal-form.tsx`)
- [ ] Fields: Name, Target Amount, Deadline (optional), Icon (optional)
- [ ] Zod validation

### 5.4 Goal detail page (`app/(app)/goals/[id]/page.tsx`)
- [ ] Large progress ring at top
- [ ] `contribution-form.tsx` — only visible when `status !== "COMPLETED"`
- [ ] `contribution-list.tsx` — table of past contributions (date, amount, note)

### 5.5 Contribution form (`components/goals/contribution-form.tsx`)
- [ ] Fields: Amount, Note (optional), Date
- [ ] On success: Sonner toast + page re-validates to show updated progress

### 5.6 Exit criteria
- [ ] Circular SVG ring fills correctly as contributions are added
- [ ] "Completed" badge appears and contribution form hides when goal is met
- [ ] Deadline countdown accurate
- [ ] `npm run build` passes

---

## Phase 6 — Dashboard Page & Components

### 6.1 Dashboard page (`app/(app)/dashboard/page.tsx`)
- [ ] Server component — parallel data fetch for all 4 dashboard queries
- [ ] Uses `Suspense` boundaries with skeleton fallbacks per section
- [ ] Floating quick-add FAB (Lucide `Plus`) fixed bottom-right → `/transactions/new`

### 6.2 Balance card (`components/dashboard/balance-card.tsx`)
- [ ] 3-column stat: Income (green) / Expenses (red) / Net (primary yellow if positive, red if negative)
- [ ] Current month label
- [ ] Glass card with elevated shadow
- [ ] Skeleton during load

### 6.3 Budget health strip (`components/dashboard/budget-health-strip.tsx`)
- [ ] Horizontally scrollable row of budget fill bars
- [ ] Each bar: category icon + name + fill bar (green/amber/red) + amount label
- [ ] "View all budgets" link at end
- [ ] Skeleton during load

### 6.4 Goals preview (`components/dashboard/goals-preview.tsx`)
- [ ] Top 3 active goals
- [ ] Mini circular progress rings (smaller version of goal-card ring)
- [ ] Goal name + percentage
- [ ] "View all goals" link
- [ ] Skeleton during load

### 6.5 Recent transactions (`components/dashboard/recent-transactions.tsx`)
- [ ] Last 8 transactions: category icon, name, date, amount (green/red)
- [ ] "View all" link to `/transactions`
- [ ] Skeleton during load

### 6.6 Exit criteria
- [ ] All 4 sections load with real data
- [ ] Skeleton loading shown during fetch; no layout shift when data arrives
- [ ] Correct month scope on balance card
- [ ] FAB navigates to `/transactions/new`
- [ ] `npm run build` passes

---

## Phase 7 — Reports Page & Charts

### 7.1 Reports page (`app/(app)/reports/page.tsx`)
- [ ] Month/year picker at top
- [ ] 4 chart sections in a 2×2 grid (stacked on mobile)
- [ ] All charts use theme-aware colors via CSS variables
- [ ] All charts wrapped in `ResponsiveContainer` from Recharts

### 7.2 Spend by category chart (`components/reports/spend-by-category-chart.tsx`)
- [ ] Recharts `BarChart` — horizontal bars
- [ ] Category names on Y axis, spend amounts on X axis
- [ ] Bar fill: `var(--color-primary)` with 80% opacity
- [ ] Custom `Tooltip` using glass styling

### 7.3 Income vs Expenses trend (`components/reports/income-vs-expenses-chart.tsx`)
- [ ] Recharts `LineChart` — last 6 months
- [ ] Income line: green; Expenses line: red
- [ ] X axis: month labels; Y axis: currency amounts
- [ ] Legend below chart

### 7.4 Daily spend heatmap (`components/reports/daily-spend-heatmap.tsx`)
- [ ] Calendar-style grid for the current month
- [ ] Each day cell: background intensity = spend amount (low → `--color-yellow-2`, high → `--color-yellow-6`)
- [ ] Tooltip on hover showing day + amount
- [ ] Days with no spend: neutral `--bg-muted`

### 7.5 Category donut chart (`components/reports/category-donut-chart.tsx`)
- [ ] Recharts `PieChart` in donut mode (`innerRadius`)
- [ ] Each slice: category color or a sequential palette from `--color-yellow-*` scale
- [ ] Centered label: total spend for the month
- [ ] Legend with category names + amounts

### 7.6 Exit criteria
- [ ] All 4 charts render with real data
- [ ] Charts recolour correctly in dark mode
- [ ] Month picker updates all charts
- [ ] No horizontal overflow on mobile
- [ ] `npm run build` passes

---

## Phase 8 — AI Insights Page & Chat UI

### 8.1 Insights page (`app/(app)/insights/page.tsx`)
- [ ] Full-height layout — sidebar + chat area fills viewport
- [ ] Shows `insights-chat.tsx` and `prompt-chips.tsx`
- [ ] Skeleton shown while context is being built on first load

### 8.2 Chat interface (`components/insights/insights-chat.tsx`)
- [ ] Scrollable message list — user messages right-aligned, AI messages left-aligned
- [ ] User message bubble: `bg-primary text-secondary` (yellow on dark)
- [ ] AI message bubble: glass card styling
- [ ] Streaming response: renders content token by token as it arrives (consume `ReadableStream`)
- [ ] Animated "thinking" indicator while waiting for first token (pulsing dots)
- [ ] Input field pinned to bottom with send button (`Send` Lucide icon)
- [ ] Input clears and send disabled while response is streaming
- [ ] Error state if stream fails — Sonner toast + retry option

### 8.3 Prompt chips (`components/insights/prompt-chips.tsx`)
- [ ] 4 preset chips visible on first load (before any message is sent):
  - "Analyse my spending this month"
  - "Where am I overspending?"
  - "Am I on track with my savings goals?"
  - "Predict my expenses for next month"
- [ ] Clicking a chip populates the input and auto-sends
- [ ] Chips hidden once first message is sent

### 8.4 Exit criteria
- [ ] Streaming renders progressively (visible word-by-word)
- [ ] Preset chips auto-send correctly
- [ ] API key is not visible in network tab or browser JS bundle
- [ ] Error state renders cleanly
- [ ] `npm run build` passes

---

## Phase 9 — Settings Page

### 9.1 Settings page (`app/(app)/settings/page.tsx`)
- [ ] Tabbed or sectioned layout with these sections:

**Profile**
- [ ] Name and email fields pre-populated
- [ ] Save button with Sonner toast on success

**Password**
- [ ] Current password + new password + confirm new password
- [ ] Inline field errors + Sonner toast

**Currency**
- [ ] Searchable `Select` (shadcn/ui `Combobox` pattern) populated from `SUPPORTED_CURRENCIES`
- [ ] On change: updates `User.currency` → all monetary values across app re-render with new symbol
- [ ] Current currency shown as selected

**Appearance**
- [ ] Dark/light mode toggle (mirrors sidebar toggle)
- [ ] Lucide `Sun`/`Moon` icons — no text labels

**Categories**
- [ ] List of user's categories with type badge (Income / Expense)
- [ ] Inline rename with edit icon
- [ ] Delete icon — shows `Dialog` confirmation; blocked if transactions exist (shows error message)
- [ ] "Add Category" form below list

**Danger Zone**
- [ ] Delete account section with red warning styling
- [ ] Requires password confirmation in `Dialog`
- [ ] On confirm: clears session → redirects to `/login`

### 9.2 Theme system verification
- [ ] `next-themes` `ThemeProvider` wraps the app in `app/layout.tsx`
- [ ] No flash of unstyled content on page load (`suppressHydrationWarning` on `<html>`)
- [ ] Dark mode verified across: sidebar, all cards, forms, charts, dialogs, sheets, badges, inputs

### 9.3 Exit criteria
- [ ] Currency change re-renders all monetary values with correct symbol
- [ ] Dark/light toggle in settings and sidebar both update the same theme state
- [ ] Category delete blocked with clear error if transactions exist
- [ ] Account deletion redirects to `/login`

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
- **Never convert stored amounts on currency change.** Currency is display-only.
- **The design system guide (`guides/finora_design_system_glassmorphism_ai_ui_ux.md`) is the visual bible.** Consult it before making any stylistic decision.
