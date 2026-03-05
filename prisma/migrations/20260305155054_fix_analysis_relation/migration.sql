/*
  Warnings:

  - You are about to drop the column `formatScore` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `grammarScore` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `readabilityScore` on the `Analysis` table. All the data in the column will be lost.
  - Added the required column `atsScore` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experienceScore` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `impactScore` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semanticScore` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `structureScore` to the `Analysis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_resumeId_fkey";

-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "formatScore",
DROP COLUMN "grammarScore",
DROP COLUMN "readabilityScore",
ADD COLUMN     "atsScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "experienceScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "impactScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "semanticScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "structureScore" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
