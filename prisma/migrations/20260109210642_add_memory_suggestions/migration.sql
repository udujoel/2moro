-- CreateTable
CREATE TABLE "MemorySuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "context" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MemorySuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemorySuggestion_userId_expiresAt_idx" ON "MemorySuggestion"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "MemorySuggestion_generatedAt_idx" ON "MemorySuggestion"("generatedAt");

-- AddForeignKey
ALTER TABLE "MemorySuggestion" ADD CONSTRAINT "MemorySuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
