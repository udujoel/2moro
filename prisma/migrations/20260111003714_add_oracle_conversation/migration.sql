-- CreateTable
CREATE TABLE "OracleConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "messages" JSONB NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OracleConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OracleConversation_userId_createdAt_idx" ON "OracleConversation"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "OracleConversation" ADD CONSTRAINT "OracleConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
