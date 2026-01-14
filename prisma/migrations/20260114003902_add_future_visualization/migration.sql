-- CreateTable
CREATE TABLE "FutureVisualization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalPhotoUrl" TEXT,
    "scenarioImages" JSONB,
    "scenarios" JSONB NOT NULL,
    "narrative" TEXT,
    "wisdomContent" TEXT,
    "dataSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FutureVisualization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FutureVisualization_userId_createdAt_idx" ON "FutureVisualization"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "FutureVisualization" ADD CONSTRAINT "FutureVisualization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
