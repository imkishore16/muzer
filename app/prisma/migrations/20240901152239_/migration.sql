/*
  Warnings:

  - You are about to drop the column `bigImage` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `smallImage` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_streamId_fkey";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "bigImage",
DROP COLUMN "smallImage",
ADD COLUMN     "bigImg" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "played" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playedTs" TIMESTAMP(3),
ADD COLUMN     "smallImg" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- CreateTable
CREATE TABLE "CurrentStream" (
    "userId" TEXT NOT NULL,
    "streamId" TEXT,

    CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_streamId_key" ON "CurrentStream"("streamId");

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
