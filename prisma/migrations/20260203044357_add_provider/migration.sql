-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('CREDENTIAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "Provider" "Provider" NOT NULL DEFAULT 'CREDENTIAL';
