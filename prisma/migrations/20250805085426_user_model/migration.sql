/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `User_verificationToken_key` ON `User`(`verificationToken`);

-- CreateIndex
CREATE UNIQUE INDEX `User_resetToken_key` ON `User`(`resetToken`);
