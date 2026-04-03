/*
  Warnings:

  - You are about to drop the column `token` on the `PasswordReset` table. All the data in the column will be lost.
  - Added the required column `otp` to the `PasswordReset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PasswordReset" DROP COLUMN "token",
ADD COLUMN     "otp" TEXT NOT NULL;
