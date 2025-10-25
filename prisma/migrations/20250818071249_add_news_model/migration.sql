/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `News` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `news` ADD COLUMN `excerpt` VARCHAR(191) NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    ADD COLUMN `tags` JSON NULL;

-- CreateIndex
CREATE UNIQUE INDEX `News_slug_key` ON `News`(`slug`);
