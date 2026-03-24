/*
  Warnings:

  - You are about to drop the column `cloudinary_public_id` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `cloudinary_url` on the `notes` table. All the data in the column will be lost.
  - Added the required column `file_data` to the `notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_name` to the `notes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notes" DROP COLUMN "cloudinary_public_id",
DROP COLUMN "cloudinary_url",
ADD COLUMN     "file_data" BYTEA NOT NULL,
ADD COLUMN     "file_mimetype" TEXT NOT NULL DEFAULT 'application/pdf',
ADD COLUMN     "file_name" TEXT NOT NULL;
