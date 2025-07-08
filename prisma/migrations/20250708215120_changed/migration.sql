/*
  Warnings:

  - You are about to drop the column `isHalfOrder` on the `MenuItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "isHalfOrder",
ADD COLUMN     "hasHalfOrder" BOOLEAN NOT NULL DEFAULT false;
