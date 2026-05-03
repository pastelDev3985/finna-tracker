# Finora

**Finora** is a personal finance web app that helps you see your **money in focus, not noise**. Track income and expenses, set monthly budgets, work toward savings goals, review spending in reports, and ask questions about your own data through an **AI insights** assistant powered by **Google Gemini** — all with a modern, glass-style UI and light/dark themes.

## What you can do

- **Transactions** — Log income and expenses with categories, notes, dates, and sorting.
- **Budgets** — Monthly limits per category with spend vs. limit tracking.
- **Goals** — Targets, contributions, and progress toward savings.
- **Reports** — Category breakdowns, trends, and daily spend views driven by your database (not mock data).
- **AI insights** — Chat-style Q&A scoped to *your* Finora data (not generic financial advice).
- **Exchange rates** — Cached GHS-based FX snapshots ([ExchangeRate-API](https://www.exchangerate-api.com/)), reference converter under **Rates** (ledger balances are not auto-converted).
- **Settings** — Profile, password, currency display, theme, and custom categories; account deletion in a guarded “danger zone.”
- **Auth** — Email verification (OTP), password reset, and secure sessions (NextAuth).

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | [Next.js](https://nextjs.org) (App Router), React 19 |
| Database | PostgreSQL via [Prisma](https://www.prisma.io) + [Neon](https://neon.tech) serverless driver |
| Auth | [Auth.js / NextAuth v5](https://authjs.dev) (credentials, JWT) |
| AI | [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini), server-side only |
| Email | [Brevo](https://www.brevo.com/) transactional API |
| UI | Tailwind CSS v4, [Base UI](https://base-ui.com/) primitives, Recharts |

## Getting started

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment** — Copy `.env.example` to `.env.local` and fill in values (database URL, `AUTH_SECRET`, `AUTH_URL`, Brevo, `GEMINI_API_KEY`, optional `EXCHANGE_RATE_API_KEY` and `CRON_SECRET` for FX sync, etc.).

3. **Database**

   ```bash
   npx prisma migrate dev
   # optional demo data
   npm run seed
   ```

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate` via `postinstall` on CI/install) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run seed` | Seed the database |

## Deploying

Finora is deployable on **Vercel** (or any Node host). Use a **pooled** `DATABASE_URL` for runtime; run `prisma migrate deploy` against production with a direct URL when needed. Set **`AUTH_URL`** to your public site origin so auth and email links resolve correctly. For FX sync, set **`EXCHANGE_RATE_API_KEY`**, **`CRON_SECRET`**, and enable the **`vercel.json`** cron (or call `GET /api/cron/update-rates` with `Authorization: Bearer <CRON_SECRET>` on a schedule). See `.env.example` for the full variable list.

## Roadmap & future goals

Ideas and planned directions (not commitments — prioritize what matters for *your* product):

- **Connections** — Bank or card import / sync (e.g. aggregators or file import) to reduce manual entry.
- **Recurring automation** — Smarter handling of subscriptions and repeating transactions in the UI and reminders.
- **Multi-currency** — True conversion rates and multi-account currencies beyond display formatting.
- **Exports & sharing** — PDF/CSV exports, monthly summaries, optional shared “household” views.
- **Notifications** — Budget alerts, goal milestones, and optional email or push nudges.
- **Mobile** — Installable PWA improvements or a dedicated native shell.
- **Deeper AI** — Optional insights templates, spend anomaly hints, and stricter safety/PII policies for production.

---

Built with Next.js. For framework docs, see [nextjs.org/docs](https://nextjs.org/docs).
