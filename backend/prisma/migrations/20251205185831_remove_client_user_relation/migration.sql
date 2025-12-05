/*
  Warnings:

  - You are about to drop the column `userId` on the `clients` table. All the data in the column will be lost.
  - Added the required column `email` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_userId_fkey";

-- DropIndex
DROP INDEX "clients_userId_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
