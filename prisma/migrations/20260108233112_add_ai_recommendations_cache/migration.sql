-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "financialRecsGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "personalityRecsGeneratedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIRecommendation_userId_type_status_idx" ON "AIRecommendation"("userId", "type", "status");
