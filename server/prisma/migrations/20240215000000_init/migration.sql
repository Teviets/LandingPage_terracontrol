-- CreateTable
CREATE TABLE IF NOT EXISTS "ContactRequest" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "source" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
