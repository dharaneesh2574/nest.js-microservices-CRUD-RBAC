/*
  Warnings:

  - You are about to drop the column `errorMessage` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `performedById` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `performedByRole` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `targetUserId` on the `audit_logs` table. All the data in the column will be lost.
  - Added the required column `initiatedBy` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordId` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tableName` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "errorMessage",
DROP COLUMN "payload",
DROP COLUMN "performedById",
DROP COLUMN "performedByRole",
DROP COLUMN "result",
DROP COLUMN "success",
DROP COLUMN "targetUserId",
ADD COLUMN     "initiatedBy" TEXT NOT NULL,
ADD COLUMN     "initiatorUsername" TEXT,
ADD COLUMN     "recordData" JSONB,
ADD COLUMN     "recordId" TEXT NOT NULL,
ADD COLUMN     "tableName" TEXT NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL;

-- DropEnum
DROP TYPE "ActionType";
