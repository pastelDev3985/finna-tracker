# Finora — Copilot / AI Coding Instructions

> Rules derived from real bugs found and fixed in this codebase. Follow every rule here before submitting any code. When in doubt, grep the existing codebase for the established pattern and copy it.

---

## 1. Server → Client Component Boundary

### 1.1 Never pass functions as props from Server Components
Functions are not serializable. Only plain data (strings, numbers, booleans, plain objects, arrays) can cross the boundary.

```tsx
// ❌ WRONG — crashes at runtime
<ClientComponent onSuccess={() => redirect("/dashboard")} />

// ✅ CORRECT — handle navigation inside the Client Component
// In the client component, call useRouter().push("/dashboard") directly
```

The only exception is **Server Actions** — functions explicitly marked `"use server"`. Those can be passed as props.

### 1.2 Never pass Prisma `Decimal` objects as props
Prisma's `Decimal` type is not a plain object and cannot be serialized across the boundary.

```tsx
// ❌ WRONG — runtime error
const data = { totalRaw: item.total }       // item.total is Decimal

// ✅ CORRECT — convert before passing
const data = { totalRaw: item.total.toNumber() }        // for chart data
const data = { limitAmountRaw: b.limitAmount.toFixed(2) } // for form inputs
```

**Rule of thumb:** Every time you map service/Prisma results in a Server Component page for a Client Component, check every field for `Decimal` types and call `.toNumber()` or `.toFixed(2)` on them.

### 1.3 Never import server-only modules in Client Components
Files with `"use client"` must not import from `lib/db.ts`, `lib/auth.ts`, `lib/services/*`, or `lib/email.ts`. If you need data in a Client Component, fetch it in the Server Component and pass it as props.

---

## 2. Server Actions Must Never Return Prisma Objects

Server actions send their return value across the network to the browser. If the return value contains a Prisma `Decimal` (or any non-serializable type), Next.js will throw at runtime — even if the client ignores the `data` field.

**Rule:** Never `return result` directly from a server action. Strip the `data` and return only what the client actually uses.

```ts
// ❌ WRONG — result.data may contain Decimal fields; crashes at runtime
export async function createTransactionAction(data: unknown) {
  const result = await createTransaction(userId, data)
  if (!result.error) revalidatePath("/transactions")
  return result   // ← sends Decimal back to browser
}

// ✅ CORRECT — only return the error string; never the Prisma row
export async function createTransactionAction(data: unknown) {
  const result = await createTransaction(userId, data)
  if (result.error) return { error: result.error }
  revalidatePath("/transactions")
  return {}
}
```

If the client genuinely needs fields from the created/updated record, convert all `Decimal` fields to `number` or `string` before returning them — do **not** return the raw Prisma object.

---

## 3. Data Shape Contracts — Server Pages → Client Components

When a Server Component page maps data to pass to a Client Component, the mapped shape must include **every field that the client will need for all operations** — including edits, forms, and updates.

**Checklist before finalising a server data map:**
- Does the client have an edit/update form? → Include the raw (unformatted) value alongside the display string
- Does the client need to send an ID to a server action? → Include the correct ID (e.g. `categoryId`, not the parent row's `id`)
- Are any monetary amounts passed as formatted strings? → Also include the raw numeric string for form inputs

```tsx
// ❌ WRONG — client tries to edit a budget but gets the wrong ID and a formatted string
const budgets = data.map((b) => ({
  id: b.id,                                      // budget row ID — NOT the category ID
  limitAmount: formatCurrency(b.limitAmount),    // "₵1,200.00" — parseFloat fails on this
}))

// ✅ CORRECT
const budgets = data.map((b) => ({
  id: b.id,
  categoryId: b.categoryId,                      // the field the form actually needs
  limitAmount: formatCurrency(b.limitAmount),    // display string
  limitAmountRaw: b.limitAmount.toFixed(2),      // "1200.00" — safe for parseFloat
}))
```

---

## 3. Navigation Links — Only Link to Routes That Exist

Before writing any `<Link href="...">` or `router.push("...")`, verify the target route file exists in `app/`.

```tsx
// ❌ WRONG — /goals/[id] does not exist yet
<Link href={`/goals/${goal.id}`}>...</Link>

// ✅ CORRECT — link to the list page until the detail page is built
<Link href="/goals">...</Link>
```

**Never nest a `<button>` inside a `<Link>` (`<a>`)** — it is invalid HTML and causes click events to bubble unexpectedly. If a card needs both navigation and a delete button, make the card a `<div>` and add a separate navigating element, or stop the event on the button with `e.stopPropagation()`.

---

## 4. React / Next.js Hook Rules

### 4.1 `useSearchParams()` requires a Suspense boundary
Any component that calls `useSearchParams()` must be wrapped in `<Suspense>` by its parent. If the search params are never actually read, remove the hook entirely rather than leaving dead code.

```tsx
// In the parent Server Component:
<Suspense fallback={<Loading />}>
  <ClientThatUsesSearchParams />
</Suspense>

// If the hook result is never used — just delete it.
```

### 4.2 Always destructure both values from `useTransition`

```tsx
// ❌ WRONG — startTransition is never available; isPending is always false
const [isPending] = useTransition()

// ✅ CORRECT
const [isPending, startTransition] = useTransition()
```

### 4.3 Remove unused imports
Unused hook imports (`useEffect`, `useCallback`, etc.) cause lint errors and create confusion. Delete them.

---

## 5. Form & Dialog UX Rules

### 5.1 Never run success-path code when a server action returns `{ error }`
Always return early after handling an error. The dialog should stay open so the user can see the problem and retry.

```tsx
// ❌ WRONG — dialog closes and form resets even on failure
const result = await createAction(data)
if (result.error) toast.error(result.error)
reset()             // runs on error too
setOpen(false)      // runs on error too

// ✅ CORRECT — early return on error
const result = await createAction(data)
if (result.error) {
  toast.error(result.error)
  return           // keeps dialog open, form populated
}
toast.success("Done")
reset()
setOpen(false)
```

### 5.2 Show field-level errors, not only toasts
Validation errors from Zod or the server must appear as inline `<p>` elements below the relevant field. A toast alone is insufficient — the user has no idea which field to fix.

---

## 6. Charts & Currency Rules

### 6.1 Guard against division by zero in percentage calculations

```tsx
// ❌ WRONG — shows "Infinity%" when totalSpend is 0
const percentage = ((value / totalSpend) * 100).toFixed(1)

// ✅ CORRECT
const percentage = totalSpend > 0
  ? ((value / totalSpend) * 100).toFixed(1)
  : "0.0"
```

### 6.2 Never hard-code a currency symbol
Every chart or component that displays a monetary value must accept a `currency: string` prop and use `getCurrencySymbol(currency)` from `lib/currency.ts`.

```tsx
// ❌ WRONG
<p>₵{value.toFixed(2)}</p>

// ✅ CORRECT
import { getCurrencySymbol } from "@/lib/currency"
// ...
const symbol = getCurrencySymbol(currency)
<p>{symbol}{value.toFixed(2)}</p>
```

### 6.3 Pass `currency` all the way down
When a page receives `currency` from the session, it must be threaded through to every chart and monetary display component as a prop. Don't let any component silently default to a hardcoded symbol.

---

## 7. CSS / Positioning Rules

### 7.1 Absolutely-positioned children need a `relative` parent
Any element using `absolute` positioning (tooltips, overlays, badges) will escape to the nearest positioned ancestor. If no ancestor has `relative`, it will fly to an unexpected location.

```tsx
// ❌ WRONG — tooltip appears in wrong place on screen
<div className="aspect-square ...">
  <div className="absolute ...">Tooltip</div>
</div>

// ✅ CORRECT
<div className="relative aspect-square ...">
  <div className="absolute ...">Tooltip</div>
</div>
```

### 7.2 Glassmorphism rules (from the design system)
- Backdrop blur: 12–18px. Use `backdrop-blur-lg` (16px) as the default.
- Light mode: use `bg-white/80` minimum opacity — `bg-white/10` is too transparent.
- Never apply yellow (`--color-primary`) over large background areas.

---

## 8. Type Safety Rules

### 8.1 Never use `as any` to resolve a type mismatch
If TypeScript is complaining about a type, fix the actual mismatch — trace the type from its source and correct the interface or the value being passed.

```tsx
// ❌ WRONG
const entry = props.payload as any
const pct = ((entry.value / total) * 100)

// ✅ CORRECT — type the payload properly
const entry = props.payload as { value: number }
const pct = ((entry.value / total) * 100)
```

### 8.2 When an interface changes, update all consumers
If you add or remove a field from a shared interface (e.g. `BudgetCardData`, `GoalCardData`, `TxRow`), immediately search for every file that constructs or destructures that type and update them all. TypeScript errors are the signal — do not suppress them with casts.

---

## 9. Monetary Arithmetic Rules

All monetary values stored in the database are Prisma `Decimal` (`@db.Decimal(14,2)`). Follow these rules without exception:

- **Never** use `parseFloat`, `Number()`, or JS arithmetic directly on `Decimal` values — use the `.add()`, `.sub()`, `.mul()`, `.div()` methods
- **Never** use `Math.round` or `Math.floor` on currency amounts
- **Always** convert `Decimal` → `number` with `.toNumber()` only at the serialization boundary (server page map), never inside service functions
- All monetary display must go through `formatCurrency(amount, currency)` from `lib/currency.ts`

---

## 10. Quick Pre-Commit Checklist

Before marking any task done, run through this list:

- [ ] Does this component cross the Server/Client boundary? If yes — are all props plain serializable values?
- [ ] Are there any Prisma `Decimal` fields in props passed to a Client Component? → Call `.toNumber()` or `.toFixed(2)` first
- [ ] Does any `<Link>` or `router.push` point to a route that actually exists in `app/`?
- [ ] Does any component call `useSearchParams()`? → Ensure a `<Suspense>` wrapper exists in the parent
- [ ] Does any `useTransition` omit `startTransition`?
- [ ] Does any form or dialog close/reset on the error path?
- [ ] Does any chart compute a percentage? → Guard the denominator against zero
- [ ] Does any chart or monetary display hard-code a currency symbol?
- [ ] Does any `absolute`-positioned element have a `relative` parent?
- [ ] Are there unused imports? → Remove them
- [ ] `npm run build` passes cleanly with zero TypeScript errors
