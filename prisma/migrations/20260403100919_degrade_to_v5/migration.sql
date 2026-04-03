/*
  Warnings:

  - You are about to drop the column `token` on the `EmailVerification` table. All the data in the column will be lost.
  - You are about to drop the `EmailOtp` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expiresAt` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otp` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmailVerification" DROP CONSTRAINT "EmailVerification_userId_fkey";

-- AlterTable
ALTER TABLE "EmailVerification" DROP COLUMN "token",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "otp" TEXT NOT NULL;

-- DropTable
DROP TABLE "EmailOtp";

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
