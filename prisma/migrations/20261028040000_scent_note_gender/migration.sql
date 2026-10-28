-- CreateEnum
CREATE TYPE "GenderTarget" AS ENUM ('Men', 'Women', 'Unisex');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('Top', 'Middle', 'Base');

-- AlterEnum
ALTER TYPE "AttachmentRecordType" ADD VALUE 'Scent';
ALTER TYPE "AttachmentRecordType" ADD VALUE 'Note';

-- CreateTable
CREATE TABLE "scent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_note" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "type" "NoteType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scent_title_key" ON "scent"("title");

-- CreateIndex
CREATE UNIQUE INDEX "note_title_key" ON "note"("title");

-- CreateIndex
CREATE INDEX "product_note_productId_idx" ON "product_note"("productId");

-- CreateIndex
CREATE INDEX "product_note_noteId_idx" ON "product_note"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "product_note_productId_noteId_type_key" ON "product_note"("productId", "noteId", "type");

-- AlterTable: add scentId, migrate genderTarget, drop scentFamily
ALTER TABLE "product" ADD COLUMN "scentId" TEXT;

-- Convert genderTarget string -> enum (null-safe)
ALTER TABLE "product" ADD COLUMN "genderTarget_new" "GenderTarget";
UPDATE "product"
SET "genderTarget_new" = CASE
  WHEN "genderTarget" ILIKE 'men' THEN 'Men'::"GenderTarget"
  WHEN "genderTarget" ILIKE 'women' THEN 'Women'::"GenderTarget"
  WHEN "genderTarget" ILIKE 'unisex' THEN 'Unisex'::"GenderTarget"
  ELSE NULL
END;
ALTER TABLE "product" DROP COLUMN "genderTarget";
ALTER TABLE "product" RENAME COLUMN "genderTarget_new" TO "genderTarget";

ALTER TABLE "product" DROP COLUMN IF EXISTS "scentFamily";

-- CreateIndex
CREATE INDEX "product_scentId_idx" ON "product"("scentId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_scentId_fkey" FOREIGN KEY ("scentId") REFERENCES "scent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_note" ADD CONSTRAINT "product_note_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_note" ADD CONSTRAINT "product_note_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
