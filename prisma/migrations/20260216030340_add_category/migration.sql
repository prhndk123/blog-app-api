/*
  Warnings:

  - Added the required column `category` to the `blogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "category" TEXT NOT NULL;
