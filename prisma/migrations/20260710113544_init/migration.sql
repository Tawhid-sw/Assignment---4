/*
  Warnings:

  - A unique constraint covering the columns `[providerId,name,brand,categoryId]` on the table `gear_items` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "gear_items_providerId_name_brand_categoryId_key" ON "gear_items"("providerId", "name", "brand", "categoryId");
