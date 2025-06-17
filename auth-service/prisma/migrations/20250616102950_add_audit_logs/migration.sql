/*
  Warnings:

  - The values [VIEW_USER,VIEW_ALL_USERS,LOGIN,SIGNUP] on the enum `ActionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ipAddress` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `performedBy` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `audit_logs` table. All the data in the column will be lost.
  - Added the required column `performedById` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performedByRole` to the `audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActionType_new" AS ENUM ('CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'GET_USER', 'GET_ALL_USERS', 'GET_USER_BY_USERNAME');
ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "ActionType_new" USING ("action"::text::"ActionType_new");
ALTER TYPE "ActionType" RENAME TO "ActionType_old";
ALTER TYPE "ActionType_new" RENAME TO "ActionType";
DROP TYPE "ActionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_performedBy_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_targetUserId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "ipAddress",
DROP COLUMN "performedBy",
DROP COLUMN "userAgent",
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "performedById" TEXT NOT NULL,
ADD COLUMN     "performedByRole" "Role" NOT NULL,
ADD COLUMN     "result" JSONB,
ADD COLUMN     "success" BOOLEAN NOT NULL DEFAULT true;
