-- CreateTable
CREATE TABLE "CompanyClick" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyClick_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompanyClick" ADD CONSTRAINT "CompanyClick_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
