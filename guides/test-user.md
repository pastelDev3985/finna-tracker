# Finora — Test Account

> Pre-seeded development account for frontend testing.
> Run `npm run seed` at any time to reset it to this exact state.

---

## Login Credentials

| Field    | Value                 |
|----------|-----------------------|
| Email    | `testuser@test.com`   |
| Password | `Test123!`            |
| Currency | GHS (Ghanaian Cedi ₵) |

> **Email verification** is pre-confirmed (`emailVerified: true`). You can log straight in — no OTP flow, no inbox needed.

---

## What's Seeded

### Transactions — 91 total (December 2025 → May 2026)

Covers 6 full months of data, giving all charts and reports a rich, varied dataset.

| Month         | Income (₵) | Expenses (₵) | Notes                                  |
|---------------|------------|--------------|----------------------------------------|
| December 2025 | 7,000      | ~4,130       | Holiday spike — big Shopping & Entertainment spend |
| January 2026  | 7,350      | ~3,165       | Normal month                           |
| February 2026 | 6,750      | ~3,230       | Valentine's dinner, doctor's visit     |
| March 2026    | 8,500      | ~3,705       | High-income month (big freelance deal) |
| April 2026    | 7,400      | ~3,720       | Average month                          |
| May 2026      | 5,500      | 1,200        | Today (May 1) — salary + rent only     |

**Categories used:** Salary, Freelance, Business, Investment, Other Income, Food & Drink, Transport, Housing, Utilities, Healthcare, Shopping, Entertainment, Education, Savings Transfer

---

### Budgets — 8 budgets set for May 2026

| Category      | Limit (₵) | Spent so far (₵) | Status            |
|---------------|-----------|------------------|-------------------|
| Food & Drink  | 1,200     | 0                | Fresh slate       |
| Transport     | 500       | 0                | Fresh slate       |
| Housing       | 1,200     | 1,200            | 100% — at limit   |
| Utilities     | 300       | 0                | Fresh slate       |
| Shopping      | 400       | 0                | Fresh slate       |
| Entertainment | 200       | 0                | Fresh slate       |
| Healthcare    | 200       | 0                | Fresh slate       |
| Education     | 300       | 0                | Fresh slate       |

> Housing is already at 100% because rent was logged on May 1, making the "over budget" badge and red progress bar immediately visible.

---

### Goals — 3 active goals

| Goal           | Target (₵) | Saved (₵) | Progress | Deadline       |
|----------------|-----------|-----------|----------|----------------|
| Emergency Fund | 10,000    | 3,500     | 35%      | 31 Dec 2026    |
| New Laptop     | 4,500     | 2,100     | 47%      | 31 Aug 2026    |
| Vacation Fund  | 8,000     | 1,200     | 15%      | 30 Nov 2026    |

Each goal has 4 monthly contributions (Jan–Apr 2026) logged in `GoalContribution`.

---

## Re-seeding

The seed script is **idempotent** — it deletes the existing test user (cascading all linked data) before re-creating everything from scratch.

```bash
npm run seed
# or
npx prisma db seed
```

---

## Notes for Frontend Devs

- **Dashboard** shows May 2026 data. Currently only salary + housing on May 1, so the balance card will show a deficit (₵5,500 income vs ₵1,200 expenses = ₵4,300 net) and the budget strip will show Housing at 100%.
- **Reports** "Income vs Expenses" trend chart covers Dec 2025 – May 2026, showing a clear spending spike in December.
- **Transactions** list has 91 rows with pagination. Test both the paginator and the edit/delete flows.
- **Budgets** for May are partially populated — add a few Food & Drink/Transport transactions after login to see the progress bars fill in real time.
- **Goals** are at varied completion percentages (15%, 35%, 47%) to validate the circular progress rings across different fill levels.
- **AI Insights** will have 6 months of context to work with — all preset chips should return meaningful responses.
