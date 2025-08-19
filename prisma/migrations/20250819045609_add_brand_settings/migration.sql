-- CreateTable
CREATE TABLE "BrandSettings" (
    "id" TEXT NOT NULL,
    "bannerImageUrl" TEXT,
    "profileImageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandSettings_pkey" PRIMARY KEY ("id")
);
