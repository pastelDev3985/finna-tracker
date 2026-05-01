import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import bcrypt from "bcryptjs"

// ─── Types ────────────────────────────────────────────────────────────────────

type TxType = "INCOME" | "EXPENSE"
type GStatus = "ACTIVE" | "COMPLETED" | "PAUSED"

interface TxRow {
  categoryId: string
  type: TxType
  amount: string
  date: Date
  note: string
}

interface BudgetRow {
  categoryId: string
  limitAmount: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** UTC midnight for a given calendar date */
const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day))

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

  try {
    console.log("🌱  Seeding test account…")

    // ── Wipe any previous run ──────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email: "testuser@test.com" } })
    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } })
      console.log("🗑️   Removed previous test user (cascade deleted all linked data)")
    }

    // ── User ──────────────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash("Test123!", 12)
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "testuser@test.com",
        password: passwordHash,
        currency: "GHS",
        emailVerified: true,
      },
    })
    console.log(`✅  User created  →  ${user.email}  (id: ${user.id})`)

    // ── Categories ────────────────────────────────────────────────────────────
    const catDefs = [
      { name: "Salary",           type: "INCOME"  as TxType, icon: "briefcase",       color: "#22c55e" },
      { name: "Freelance",        type: "INCOME"  as TxType, icon: "laptop",          color: "#16a34a" },
      { name: "Business",         type: "INCOME"  as TxType, icon: "building-2",      color: "#15803d" },
      { name: "Investment",       type: "INCOME"  as TxType, icon: "trending-up",     color: "#166534" },
      { name: "Other Income",     type: "INCOME"  as TxType, icon: "plus-circle",     color: "#14532d" },
      { name: "Food & Drink",     type: "EXPENSE" as TxType, icon: "utensils",        color: "#f04438" },
      { name: "Transport",        type: "EXPENSE" as TxType, icon: "car",             color: "#ef4444" },
      { name: "Housing",          type: "EXPENSE" as TxType, icon: "home",            color: "#dc2626" },
      { name: "Utilities",        type: "EXPENSE" as TxType, icon: "zap",             color: "#b91c1c" },
      { name: "Healthcare",       type: "EXPENSE" as TxType, icon: "heart-pulse",     color: "#991b1b" },
      { name: "Shopping",         type: "EXPENSE" as TxType, icon: "shopping-bag",    color: "#f97316" },
      { name: "Entertainment",    type: "EXPENSE" as TxType, icon: "tv",              color: "#ea580c" },
      { name: "Education",        type: "EXPENSE" as TxType, icon: "graduation-cap",  color: "#c2410c" },
      { name: "Savings Transfer", type: "EXPENSE" as TxType, icon: "piggy-bank",      color: "#FFD100" },
      { name: "Other",            type: "EXPENSE" as TxType, icon: "more-horizontal", color: "#737373" },
    ]

    await prisma.category.createMany({
      data: catDefs.map((c) => ({ ...c, userId: user.id })),
    })

    const allCats = await prisma.category.findMany({ where: { userId: user.id } })
    const c: Record<string, string> = Object.fromEntries(allCats.map((cat) => [cat.name, cat.id]))
    console.log(`✅  ${allCats.length} categories created`)

    // ── Transactions ──────────────────────────────────────────────────────────
    // 6 months of data: December 2025 → May 2026
    // Gives the Reports "last 6 months" chart a full, varied dataset.

    const txData: TxRow[] = [

      // ═══════════════════════ DECEMBER 2025 ═══════════════════════════════════
      // Income
      { categoryId: c["Salary"],           type: "INCOME",  amount: "5500.00", date: d(2025,12, 1), note: "December salary" },
      { categoryId: c["Freelance"],        type: "INCOME",  amount: "1000.00", date: d(2025,12,10), note: "Year-end dev contract" },
      { categoryId: c["Other Income"],     type: "INCOME",  amount: "500.00",  date: d(2025,12,20), note: "Christmas bonus" },
      // Expenses
      { categoryId: c["Housing"],          type: "EXPENSE", amount: "1200.00", date: d(2025,12, 2), note: "Monthly rent" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "150.00",  date: d(2025,12, 3), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "80.00",   date: d(2025,12, 7), note: "Lunch & snacks" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "120.00",  date: d(2025,12,14), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "200.00",  date: d(2025,12,24), note: "Christmas dinner groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "90.00",   date: d(2025,12,28), note: "Post-Christmas food" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "90.00",   date: d(2025,12, 5), note: "Uber rides" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "70.00",   date: d(2025,12,20), note: "Holiday travel fuel" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "195.00",  date: d(2025,12, 5), note: "ECG bill" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "85.00",   date: d(2025,12, 5), note: "Internet subscription" },
      { categoryId: c["Shopping"],         type: "EXPENSE", amount: "800.00",  date: d(2025,12,15), note: "Christmas gifts" },
      { categoryId: c["Shopping"],         type: "EXPENSE", amount: "250.00",  date: d(2025,12,22), note: "Decorations & extras" },
      { categoryId: c["Entertainment"],    type: "EXPENSE", amount: "150.00",  date: d(2025,12,20), note: "Christmas party" },
      { categoryId: c["Entertainment"],    type: "EXPENSE", amount: "120.00",  date: d(2025,12,26), note: "Boxing Day outings" },
      { categoryId: c["Healthcare"],       type: "EXPENSE", amount: "100.00",  date: d(2025,12, 8), note: "Pharmacy" },

      // ═══════════════════════ JANUARY 2026 ════════════════════════════════════
      { categoryId: c["Salary"],           type: "INCOME",  amount: "5500.00", date: d(2026, 1, 1), note: "January salary" },
      { categoryId: c["Freelance"],        type: "INCOME",  amount: "1200.00", date: d(2026, 1, 8), note: "Web design project" },
      { categoryId: c["Freelance"],        type: "INCOME",  amount: "650.00",  date: d(2026, 1,20), note: "Logo design" },
      { categoryId: c["Housing"],          type: "EXPENSE", amount: "1200.00", date: d(2026, 1, 2), note: "Monthly rent" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "120.00",  date: d(2026, 1, 3), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "45.00",   date: d(2026, 1, 6), note: "Lunch out" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "95.00",   date: d(2026, 1,10), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "65.00",   date: d(2026, 1,15), note: "Dinner with friends" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "110.00",  date: d(2026, 1,21), note: "Weekly groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "55.00",   date: d(2026, 1,27), note: "Takeout" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "80.00",   date: d(2026, 1, 4), note: "Uber rides" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "60.00",   date: d(2026, 1,14), note: "Fuel top-up" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "45.00",   date: d(2026, 1,22), note: "Trotro & Uber" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "180.00",  date: d(2026, 1, 5), note: "ECG bill" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "85.00",   date: d(2026, 1, 5), note: "Internet subscription" },
      { categoryId: c["Shopping"],         type: "EXPENSE", amount: "320.00",  date: d(2026, 1,12), note: "Clothing & accessories" },
      { categoryId: c["Entertainment"],    type: "EXPENSE", amount: "80.00",   date: d(2026, 1,18), note: "Cinema & outings" },
      { categoryId: c["Entertainment"],    type: "EXPENSE", amount: "50.00",   date: d(2026, 1,25), note: "Streaming subscriptions" },

      // ═══════════════════════ FEBRUARY 2026 ═══════════════════════════════════
      { categoryId: c["Salary"],           type: "INCOME",  amount: "5500.00", date: d(2026, 2, 1), note: "February salary" },
      { categoryId: c["Freelance"],        type: "INCOME",  amount: "900.00",  date: d(2026, 2,14), note: "Content writing gig" },
      { categoryId: c["Investment"],       type: "INCOME",  amount: "350.00",  date: d(2026, 2,28), note: "Dividend payout" },
      { categoryId: c["Housing"],          type: "EXPENSE", amount: "1200.00", date: d(2026, 2, 2), note: "Monthly rent" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "105.00",  date: d(2026, 2, 4), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "75.00",   date: d(2026, 2, 9), note: "Restaurant dinner" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "90.00",   date: d(2026, 2,16), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "120.00",  date: d(2026, 2,22), note: "Valentine's dinner" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "60.00",   date: d(2026, 2,27), note: "Takeout" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "70.00",   date: d(2026, 2, 6), note: "Uber rides" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "55.00",   date: d(2026, 2,18), note: "Fuel top-up" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "175.00",  date: d(2026, 2, 5), note: "ECG bill" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "85.00",   date: d(2026, 2, 5), note: "Internet subscription" },
      { categoryId: c["Healthcare"],       type: "EXPENSE", amount: "150.00",  date: d(2026, 2,11), note: "Doctor's visit" },
      { categoryId: c["Shopping"],         type: "EXPENSE", amount: "200.00",  date: d(2026, 2,20), note: "Electronics accessories" },
      { categoryId: c["Entertainment"],    type: "EXPENSE", amount: "60.00",   date: d(2026, 2,23), note: "Streaming & games" },
      { categoryId: c["Education"],        type: "EXPENSE", amount: "350.00",  date: d(2026, 2,15), note: "Online course" },

      // ═══════════════════════ MARCH 2026 ══════════════════════════════════════
      { categoryId: c["Salary"],           type: "INCOME",  amount: "5500.00", date: d(2026, 3, 1), note: "March salary" },
      { categoryId: c["Freelance"],        type: "INCOME",  amount: "2200.00", date: d(2026, 3,10), note: "App development contract" },
      { categoryId: c["Business"],         type: "INCOME",  amount: "800.00",  date: d(2026, 3,22), note: "Consulting fee" },
      { categoryId: c["Housing"],          type: "EXPENSE", amount: "1200.00", date: d(2026, 3, 2), note: "Monthly rent" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "130.00",  date: d(2026, 3, 3), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "55.00",   date: d(2026, 3, 7), note: "Lunch" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "100.00",  date: d(2026, 3,13), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "80.00",   date: d(2026, 3,19), note: "Dinner outing" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "95.00",   date: d(2026, 3,25), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "45.00",   date: d(2026, 3,30), note: "Takeout" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "90.00",   date: d(2026, 3, 5), note: "Uber & fuel" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "65.00",   date: d(2026, 3,20), note: "Road trip fuel" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "200.00",  date: d(2026, 3, 5), note: "ECG bill" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "85.00",   date: d(2026, 3, 5), note: "Internet subscription" },
      { categoryId: c["Healthcare"],       type: "EXPENSE", amount: "80.00",   date: d(2026, 3,15), note: "Pharmacy" },
      { categoryId: c["Shopping"],         type: "EXPENSE", amount: "450.00",  date: d(2026, 3, 8), note: "Shoes & clothes" },
      { categoryId: c["Entertainment"],    type: "EXPENSE", amount: "120.00",  date: d(2026, 3,16), note: "Concert tickets" },
      { categoryId: c["Savings Transfer"], type: "EXPENSE", amount: "500.00",  date: d(2026, 3,28), note: "Monthly savings transfer" },

      // ═══════════════════════ APRIL 2026 ══════════════════════════════════════
      { categoryId: c["Salary"],           type: "INCOME",  amount: "5500.00", date: d(2026, 4, 1), note: "April salary" },
      { categoryId: c["Freelance"],        type: "INCOME",  amount: "1500.00", date: d(2026, 4,12), note: "UI design project" },
      { categoryId: c["Other Income"],     type: "INCOME",  amount: "400.00",  date: d(2026, 4,20), note: "Sold old electronics" },
      { categoryId: c["Housing"],          type: "EXPENSE", amount: "1200.00", date: d(2026, 4, 2), note: "Monthly rent" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "115.00",  date: d(2026, 4, 4), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "60.00",   date: d(2026, 4, 8), note: "Business lunch" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "95.00",   date: d(2026, 4,14), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "70.00",   date: d(2026, 4,18), note: "Family dinner" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "85.00",   date: d(2026, 4,24), note: "Groceries" },
      { categoryId: c["Food & Drink"],     type: "EXPENSE", amount: "40.00",   date: d(2026, 4,29), note: "Snacks & drinks" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "75.00",   date: d(2026, 4, 6), note: "Uber rides" },
      { categoryId: c["Transport"],        type: "EXPENSE", amount: "60.00",   date: d(2026, 4,19), note: "Fuel top-up" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "190.00",  date: d(2026, 4, 5), note: "ECG bill" },
      { categoryId: c["Utilities"],        type: "EXPENSE", amount: "85.00",   date: d(2026, 4, 5), note: "Internet subscription" },
      { categoryId: c["Shopping"],         type: "EXPENSE", amount: "280.00",  date: d(2026, 4,10), note: "Home supplies" },
      { categoryId: c["Entertainment"],    type: "EXPENSE", amount: "90.00",   date: d(2026, 4,22), note: "Movies & bowling" },
      { categoryId: c["Education"],        type: "EXPENSE", amount: "200.00",  date: d(2026, 4,15), note: "Books & online courses" },
      { categoryId: c["Savings Transfer"], type: "EXPENSE", amount: "500.00",  date: d(2026, 4,28), note: "Monthly savings transfer" },

      // ═══════════════════════ MAY 2026 (today = May 1) ════════════════════════
      { categoryId: c["Salary"],           type: "INCOME",  amount: "5500.00", date: d(2026, 5, 1), note: "May salary" },
      { categoryId: c["Housing"],          type: "EXPENSE", amount: "1200.00", date: d(2026, 5, 1), note: "Monthly rent" },
    ]

    await prisma.transaction.createMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: txData.map((t) => ({ ...t, userId: user.id, recurrence: "NONE" as any })),
    })
    console.log(`✅  ${txData.length} transactions created  (Dec 2025 → May 2026)`)

    // ── Budgets for May 2026 ──────────────────────────────────────────────────
    // Housing already has ₵1200 spent (rent on May 1) → shows as 100% immediately
    // Food & Drink has ₵0 spent → fresh slate to demonstrate the UI

    const budgetData: BudgetRow[] = [
      { categoryId: c["Food & Drink"],  limitAmount: "1200.00" },
      { categoryId: c["Transport"],     limitAmount: "500.00"  },
      { categoryId: c["Housing"],       limitAmount: "1200.00" },
      { categoryId: c["Utilities"],     limitAmount: "300.00"  },
      { categoryId: c["Shopping"],      limitAmount: "400.00"  },
      { categoryId: c["Entertainment"], limitAmount: "200.00"  },
      { categoryId: c["Healthcare"],    limitAmount: "200.00"  },
      { categoryId: c["Education"],     limitAmount: "300.00"  },
    ]

    await prisma.budget.createMany({
      data: budgetData.map((b) => ({ ...b, userId: user.id, month: 5, year: 2026 })),
    })
    console.log(`✅  ${budgetData.length} budgets created for May 2026`)

    // ── Goals ─────────────────────────────────────────────────────────────────
    // Contributions are stored separately; savedAmount on the goal must equal the sum.
    // Emergency Fund : 800 + 700 + 1000 + 1000 = 3500
    // New Laptop     : 500 + 400 + 600 + 600  = 2100
    // Vacation Fund  : 300 + 300 + 300 + 300  = 1200

    const goalEmergency = await prisma.goal.create({
      data: {
        userId: user.id,
        name: "Emergency Fund",
        targetAmount: "10000.00",
        savedAmount: "3500.00",
        deadline: d(2026, 12, 31),
        status: "ACTIVE" as GStatus,
        icon: "shield",
      },
    })

    const goalLaptop = await prisma.goal.create({
      data: {
        userId: user.id,
        name: "New Laptop",
        targetAmount: "4500.00",
        savedAmount: "2100.00",
        deadline: d(2026, 8, 31),
        status: "ACTIVE" as GStatus,
        icon: "laptop",
      },
    })

    const goalVacation = await prisma.goal.create({
      data: {
        userId: user.id,
        name: "Vacation Fund",
        targetAmount: "8000.00",
        savedAmount: "1200.00",
        deadline: d(2026, 11, 30),
        status: "ACTIVE" as GStatus,
        icon: "plane",
      },
    })

    // ── Goal contributions ─────────────────────────────────────────────────────
    await prisma.goalContribution.createMany({
      data: [
        // Emergency Fund
        { goalId: goalEmergency.id, amount: "800.00",  date: d(2026, 1, 31), note: "January savings"  },
        { goalId: goalEmergency.id, amount: "700.00",  date: d(2026, 2, 28), note: "February savings" },
        { goalId: goalEmergency.id, amount: "1000.00", date: d(2026, 3, 31), note: "Big March push"   },
        { goalId: goalEmergency.id, amount: "1000.00", date: d(2026, 4, 30), note: "April savings"    },
        // New Laptop
        { goalId: goalLaptop.id,    amount: "500.00",  date: d(2026, 1, 31), note: "January"  },
        { goalId: goalLaptop.id,    amount: "400.00",  date: d(2026, 2, 28), note: "February" },
        { goalId: goalLaptop.id,    amount: "600.00",  date: d(2026, 3, 31), note: "March"    },
        { goalId: goalLaptop.id,    amount: "600.00",  date: d(2026, 4, 30), note: "April"    },
        // Vacation Fund
        { goalId: goalVacation.id,  amount: "300.00",  date: d(2026, 1, 31), note: "January"  },
        { goalId: goalVacation.id,  amount: "300.00",  date: d(2026, 2, 28), note: "February" },
        { goalId: goalVacation.id,  amount: "300.00",  date: d(2026, 3, 31), note: "March"    },
        { goalId: goalVacation.id,  amount: "300.00",  date: d(2026, 4, 30), note: "April"    },
      ],
    })
    console.log("✅  3 goals created with 12 contributions")

    console.log(`
╔══════════════════════════════════════╗
║        Seed completed! 🎉            ║
╠══════════════════════════════════════╣
║  Email    : testuser@test.com        ║
║  Password : Test123!                 ║
║  Currency : GHS (Ghanaian Cedi ₵)   ║
╠══════════════════════════════════════╣
║  Transactions : ${String(txData.length).padEnd(19)}║
║  Budgets      : ${String(budgetData.length).padEnd(19)}║
║  Goals        : 3                    ║
╚══════════════════════════════════════╝`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error("❌  Seed failed:", err)
  process.exit(1)
})
