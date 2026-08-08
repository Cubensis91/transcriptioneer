-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'DONE');

-- AlterEnum
ALTER TYPE "ProcessingStage" ADD VALUE 'ANALYZING';

-- CreateTable
CREATE TABLE "KnowledgeItem" (
    "id" TEXT NOT NULL,
    "sourceFileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailedSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeItemTopic" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeItemTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeItemKeyword" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeItemKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeItemTag" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeItemTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationEntity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonMention" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "context" TEXT,

    CONSTRAINT "PersonMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMention" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "context" TEXT,

    CONSTRAINT "OrganizationMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationMention" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "context" TEXT,

    CONSTRAINT "LocationMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDate" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "assignee" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenIssue" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fact" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "knowledgeItemId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "speaker" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeItem_sourceFileId_key" ON "KnowledgeItem"("sourceFileId");

-- CreateIndex
CREATE INDEX "Topic_organizationId_idx" ON "Topic"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_organizationId_name_key" ON "Topic"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Keyword_organizationId_idx" ON "Keyword"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_organizationId_name_key" ON "Keyword"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Tag_organizationId_idx" ON "Tag"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_organizationId_name_key" ON "Tag"("organizationId", "name");

-- CreateIndex
CREATE INDEX "KnowledgeItemTopic_topicId_idx" ON "KnowledgeItemTopic"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeItemTopic_knowledgeItemId_topicId_key" ON "KnowledgeItemTopic"("knowledgeItemId", "topicId");

-- CreateIndex
CREATE INDEX "KnowledgeItemKeyword_keywordId_idx" ON "KnowledgeItemKeyword"("keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeItemKeyword_knowledgeItemId_keywordId_key" ON "KnowledgeItemKeyword"("knowledgeItemId", "keywordId");

-- CreateIndex
CREATE INDEX "KnowledgeItemTag_tagId_idx" ON "KnowledgeItemTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeItemTag_knowledgeItemId_tagId_key" ON "KnowledgeItemTag"("knowledgeItemId", "tagId");

-- CreateIndex
CREATE INDEX "Person_organizationId_idx" ON "Person"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_organizationId_name_key" ON "Person"("organizationId", "name");

-- CreateIndex
CREATE INDEX "OrganizationEntity_organizationId_idx" ON "OrganizationEntity"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationEntity_organizationId_name_key" ON "OrganizationEntity"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Location_organizationId_idx" ON "Location"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_organizationId_name_key" ON "Location"("organizationId", "name");

-- CreateIndex
CREATE INDEX "PersonMention_personId_idx" ON "PersonMention"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonMention_knowledgeItemId_personId_key" ON "PersonMention"("knowledgeItemId", "personId");

-- CreateIndex
CREATE INDEX "OrganizationMention_organizationId_idx" ON "OrganizationMention"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMention_knowledgeItemId_organizationId_key" ON "OrganizationMention"("knowledgeItemId", "organizationId");

-- CreateIndex
CREATE INDEX "LocationMention_locationId_idx" ON "LocationMention"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "LocationMention_knowledgeItemId_locationId_key" ON "LocationMention"("knowledgeItemId", "locationId");

-- CreateIndex
CREATE INDEX "EventDate_knowledgeItemId_idx" ON "EventDate"("knowledgeItemId");

-- CreateIndex
CREATE INDEX "Decision_knowledgeItemId_idx" ON "Decision"("knowledgeItemId");

-- CreateIndex
CREATE INDEX "Task_knowledgeItemId_idx" ON "Task"("knowledgeItemId");

-- CreateIndex
CREATE INDEX "Question_knowledgeItemId_idx" ON "Question"("knowledgeItemId");

-- CreateIndex
CREATE INDEX "OpenIssue_knowledgeItemId_idx" ON "OpenIssue"("knowledgeItemId");

-- CreateIndex
CREATE INDEX "Fact_knowledgeItemId_idx" ON "Fact"("knowledgeItemId");

-- CreateIndex
CREATE INDEX "Quote_knowledgeItemId_idx" ON "Quote"("knowledgeItemId");

-- AddForeignKey
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "SourceFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItemTopic" ADD CONSTRAINT "KnowledgeItemTopic_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItemTopic" ADD CONSTRAINT "KnowledgeItemTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItemKeyword" ADD CONSTRAINT "KnowledgeItemKeyword_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItemKeyword" ADD CONSTRAINT "KnowledgeItemKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItemTag" ADD CONSTRAINT "KnowledgeItemTag_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItemTag" ADD CONSTRAINT "KnowledgeItemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationEntity" ADD CONSTRAINT "OrganizationEntity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonMention" ADD CONSTRAINT "PersonMention_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonMention" ADD CONSTRAINT "PersonMention_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMention" ADD CONSTRAINT "OrganizationMention_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMention" ADD CONSTRAINT "OrganizationMention_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "OrganizationEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationMention" ADD CONSTRAINT "LocationMention_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationMention" ADD CONSTRAINT "LocationMention_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDate" ADD CONSTRAINT "EventDate_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenIssue" ADD CONSTRAINT "OpenIssue_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "KnowledgeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

