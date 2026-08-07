-- CreateEnum
CREATE TYPE "SourceFileStatus" AS ENUM ('PENDING', 'UPLOADED', 'FAILED');

-- CreateTable
CREATE TABLE "SourceFile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" "SourceFileStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourceFile_storageKey_key" ON "SourceFile"("storageKey");

-- CreateIndex
CREATE INDEX "SourceFile_organizationId_idx" ON "SourceFile"("organizationId");

-- AddForeignKey
ALTER TABLE "SourceFile" ADD CONSTRAINT "SourceFile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceFile" ADD CONSTRAINT "SourceFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

