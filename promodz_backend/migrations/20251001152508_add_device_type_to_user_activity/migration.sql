-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET', 'OTHER');

-- AlterTable
ALTER TABLE "UserActivity" ADD COLUMN     "device" "DeviceType" NOT NULL DEFAULT 'OTHER';
