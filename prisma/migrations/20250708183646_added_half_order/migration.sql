/*
  Warnings:

  - Added the required column `variant` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "halfPrice" INTEGER,
ADD COLUMN     "isHalfOrder" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variant" TEXT NOT NULL;
