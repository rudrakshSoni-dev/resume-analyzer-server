/*
  Warnings:

  - You are about to drop the column `foramtScore` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `readablityScore` on the `Analysis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "foramtScore",
DROP COLUMN "readablityScore",
ADD COLUMN     "formatScore" DOUBLE PRECISION,
ADD COLUMN     "readabilityScore" DOUBLE PRECISION;
