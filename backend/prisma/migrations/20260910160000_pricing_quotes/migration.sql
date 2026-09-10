CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Quote_configurationId_idx" ON "Quote"("configurationId");
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "Configuration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
