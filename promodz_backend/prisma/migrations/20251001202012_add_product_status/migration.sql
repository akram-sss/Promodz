-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'DELETED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';
