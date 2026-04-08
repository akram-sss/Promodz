/*
  Warnings:

  - You are about to drop the column `device` on the `UserActivity` table. All the data in the column will be lost.
  - Added the required column `action` to the `UserActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserActivity" DROP COLUMN "device",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "os" TEXT;
