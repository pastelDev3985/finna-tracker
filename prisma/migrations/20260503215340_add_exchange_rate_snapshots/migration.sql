-- CreateTable
CREATE TABLE "exchange_rate_snapshots" (
    "id" TEXT NOT NULL,
    "base_currency" TEXT NOT NULL DEFAULT 'GHS',
    "rates_json" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rate_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchange_rate_snapshots_fetched_at_idx" ON "exchange_rate_snapshots"("fetched_at" DESC);
