/*
  Warnings:

  - The primary key for the `_MemoryToPerson` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_MemoryToPerson` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "lastCompletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locationName" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "weather" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferences" JSONB;

-- AlterTable
ALTER TABLE "_MemoryToPerson" DROP CONSTRAINT "_MemoryToPerson_AB_pkey";

-- CreateTable
CREATE TABLE "MemoryMedia" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoryMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiographyChapter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "lastGeneratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BiographyChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalityTest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mbtiType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "traits" JSONB NOT NULL,
    "testType" TEXT NOT NULL DEFAULT 'mbti',
    "responses" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalityTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompassTodo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL DEFAULT 'ai',
    "googleEventId" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompassTodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dataJson" JSONB NOT NULL,
    "healthScore" INTEGER,
    "aiReport" TEXT,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleCalendarEnabled" BOOLEAN NOT NULL DEFAULT false,
    "googleRefreshToken" TEXT,
    "googleAccessToken" TEXT,
    "monthlyInvestment" INTEGER NOT NULL DEFAULT 100,
    "expectedReturn" DOUBLE PRECISION NOT NULL DEFAULT 0.07,
    "lastHoroscopeFetch" TIMESTAMP(3),
    "cachedHoroscope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonalityTest_userId_createdAt_idx" ON "PersonalityTest"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompassTodo_googleEventId_key" ON "CompassTodo"("googleEventId");

-- CreateIndex
CREATE INDEX "CompassTodo_userId_status_timeframe_idx" ON "CompassTodo"("userId", "status", "timeframe");

-- CreateIndex
CREATE INDEX "FinancialSnapshot_userId_createdAt_idx" ON "FinancialSnapshot"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_MemoryToPerson_AB_unique" ON "_MemoryToPerson"("A", "B");

-- AddForeignKey
ALTER TABLE "MemoryMedia" ADD CONSTRAINT "MemoryMedia_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiographyChapter" ADD CONSTRAINT "BiographyChapter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalityTest" ADD CONSTRAINT "PersonalityTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompassTodo" ADD CONSTRAINT "CompassTodo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialSnapshot" ADD CONSTRAINT "FinancialSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
