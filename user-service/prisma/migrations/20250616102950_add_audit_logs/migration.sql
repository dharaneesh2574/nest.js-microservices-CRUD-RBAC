/*
  Warnings:

  - The values [VIEW_USER,VIEW_ALL_USERS,LOGIN,SIGNUP] on the enum `ActionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ipAddress` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `performedBy` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `audit_logs` table. All the data in the column will be lost.
  - Added the required column `performedById` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performedByRole` to the `audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- Drop the existing audit_logs table
DROP TABLE IF EXISTS "audit_logs";

-- Drop the old ActionType enum
DROP TYPE IF EXISTS "ActionType";

-- Create new ActionType enum
CREATE TYPE "ActionType" AS ENUM ('CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'GET_USER', 'GET_ALL_USERS', 'GET_USER_BY_USERNAME');

-- Create the audit_logs table with the new structure
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "performedByRole" "Role" NOT NULL,
    "targetUserId" TEXT,
    "action" "ActionType" NOT NULL,
    "payload" JSONB,
    "result" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
