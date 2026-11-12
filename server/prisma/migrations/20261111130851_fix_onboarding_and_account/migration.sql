-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'SAVINGS';

-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'SAVINGS',
ADD COLUMN     "applicationNote" TEXT;
