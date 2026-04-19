-- CreateTable
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL,
    "customLinkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matched_commits" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "diff" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matched_commits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requirements_customLinkId_idx" ON "requirements"("customLinkId");

-- CreateIndex
CREATE INDEX "matched_commits_requirementId_idx" ON "matched_commits"("requirementId");

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_customLinkId_fkey" FOREIGN KEY ("customLinkId") REFERENCES "custom_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matched_commits" ADD CONSTRAINT "matched_commits_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
