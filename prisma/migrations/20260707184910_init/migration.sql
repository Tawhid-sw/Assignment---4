/*
  Warnings:

  - You are about to drop the `RentalItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RentalItem" DROP CONSTRAINT "RentalItem_gearItemId_fkey";

-- DropForeignKey
ALTER TABLE "RentalItem" DROP CONSTRAINT "RentalItem_rentalOrderId_fkey";

-- DropTable
DROP TABLE "RentalItem";

-- CreateTable
CREATE TABLE "rental_item" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "rentalOrderId" TEXT NOT NULL,
    "gearItemId" TEXT NOT NULL,

    CONSTRAINT "rental_item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rental_item" ADD CONSTRAINT "rental_item_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_item" ADD CONSTRAINT "rental_item_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "gear_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
