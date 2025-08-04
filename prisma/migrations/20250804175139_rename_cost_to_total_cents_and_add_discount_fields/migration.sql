-- Rename cost column to totalCents
ALTER TABLE "Order" RENAME COLUMN "cost" TO "totalCents";

-- Add new discount-related columns
ALTER TABLE "Order" ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "discountCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "subtotalCents" INTEGER NOT NULL DEFAULT 0;

-- Update existing records to set subtotalCents equal to totalCents (since there were no discounts before)
UPDATE "Order" SET "subtotalCents" = "totalCents";
