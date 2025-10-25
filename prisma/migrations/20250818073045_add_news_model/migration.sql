/*
  Warnings:

  - You are about to drop the column `excerpt` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `news` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `News_slug_key` ON `news`;

-- AlterTable
ALTER TABLE `news` DROP COLUMN `excerpt`,
    DROP COLUMN `imageUrl`,
    DROP COLUMN `slug`,
    DROP COLUMN `tags`;
