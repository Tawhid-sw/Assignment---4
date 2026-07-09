import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Same client setup as src/lib/prisma.ts (or wherever yours lives),
// duplicated here because seed.ts runs standalone, outside your app's import graph.
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─────────────────────────────────────────────
  // 1. Clean existing data (children first, respecting FK order)
  // ─────────────────────────────────────────────
  await prisma.review.deleteMany();
  await prisma.rentalItem.deleteMany();
  await prisma.rentalOrder.deleteMany();
  await prisma.gearItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ─────────────────────────────────────────────
  // 2. Users — 1 admin, 2 providers, 2 customers
  // ─────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@gearup.com",
      password: passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const provider1 = await prisma.user.create({
    data: {
      name: "Dhaka Outdoor Gear Co.",
      email: "provider1@gearup.com",
      password: passwordHash,
      role: "PROVIDER",
      status: "ACTIVE",
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      name: "Trailblazer Rentals",
      email: "provider2@gearup.com",
      password: passwordHash,
      role: "PROVIDER",
      status: "ACTIVE",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "Rahim Uddin",
      email: "customer1@gearup.com",
      password: passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Karim Hossain",
      email: "customer2@gearup.com",
      password: passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  console.log("✅ Users created");

  // ─────────────────────────────────────────────
  // 3. Categories
  // ─────────────────────────────────────────────
  const cycling = await prisma.category.create({
    data: { name: "Cycling", description: "Bikes and cycling accessories" },
  });
  const camping = await prisma.category.create({
    data: {
      name: "Camping",
      description: "Tents, sleeping bags, and camp gear",
    },
  });
  const fitness = await prisma.category.create({
    data: { name: "Fitness", description: "Gym and workout equipment" },
  });
  const waterSports = await prisma.category.create({
    data: {
      name: "Water Sports",
      description: "Kayaks, paddleboards, and more",
    },
  });

  console.log("✅ Categories created");

  // ─────────────────────────────────────────────
  // 4. Gear items — spread across both providers
  // ─────────────────────────────────────────────
  const mountainBike = await prisma.gearItem.create({
    data: {
      name: "Trek Mountain Bike",
      description: "21-speed mountain bike, great for rough terrain.",
      brand: "Trek",
      pricePerDay: 500,
      stockQuantity: 5,
      isAvailable: true,
      providerId: provider1.id,
      categoryId: cycling.id,
    },
  });

  const roadBike = await prisma.gearItem.create({
    data: {
      name: "Giant Road Bike",
      description: "Lightweight road bike for city rides.",
      brand: "Giant",
      pricePerDay: 400,
      stockQuantity: 3,
      isAvailable: true,
      providerId: provider1.id,
      categoryId: cycling.id,
    },
  });

  const dumbbellSet = await prisma.gearItem.create({
    data: {
      name: "Adjustable Dumbbell Set",
      description: "5-25kg adjustable dumbbells, pair.",
      brand: "Bowflex",
      pricePerDay: 200,
      stockQuantity: 8,
      isAvailable: true,
      providerId: provider1.id,
      categoryId: fitness.id,
    },
  });

  const tent = await prisma.gearItem.create({
    data: {
      name: "4-Person Camping Tent",
      description: "Waterproof tent, easy setup, sleeps 4.",
      brand: "Coleman",
      pricePerDay: 350,
      stockQuantity: 4,
      isAvailable: true,
      providerId: provider2.id,
      categoryId: camping.id,
    },
  });

  const sleepingBag = await prisma.gearItem.create({
    data: {
      name: "Insulated Sleeping Bag",
      description: "Good for temperatures down to -5°C.",
      brand: "North Face",
      pricePerDay: 150,
      stockQuantity: 6,
      isAvailable: true,
      providerId: provider2.id,
      categoryId: camping.id,
    },
  });

  const kayak = await prisma.gearItem.create({
    data: {
      name: "Single Kayak",
      description: "Stable single-person kayak with paddle included.",
      brand: "Perception",
      pricePerDay: 600,
      stockQuantity: 2,
      isAvailable: true,
      providerId: provider2.id,
      categoryId: waterSports.id,
    },
  });

  console.log("✅ Gear items created");

  // ─────────────────────────────────────────────
  // 5. Rental orders + items — no payment, a few different statuses
  //    so provider/customer status views have something to show
  // ─────────────────────────────────────────────
  const order1 = await prisma.rentalOrder.create({
    data: {
      customerId: customer1.id,
      providerId: provider1.id,
      startDate: new Date("2026-07-12"),
      endDate: new Date("2026-07-15"),
      totalAmount: 1500, // 500/day * 3 days
      status: "CONFIRMED",
      rentalItems: {
        create: [
          { gearItemId: mountainBike.id, quantity: 1, pricePerDay: 500 },
        ],
      },
    },
  });

  const order2 = await prisma.rentalOrder.create({
    data: {
      customerId: customer1.id,
      providerId: provider2.id,
      startDate: new Date("2026-07-18"),
      endDate: new Date("2026-07-20"),
      totalAmount: 1000, // (350 + 150) * 2 days
      status: "PLACED",
      rentalItems: {
        create: [
          { gearItemId: tent.id, quantity: 1, pricePerDay: 350 },
          { gearItemId: sleepingBag.id, quantity: 1, pricePerDay: 150 },
        ],
      },
    },
  });

  const order3 = await prisma.rentalOrder.create({
    data: {
      customerId: customer2.id,
      providerId: provider2.id,
      startDate: new Date("2026-06-20"),
      endDate: new Date("2026-06-22"),
      totalAmount: 1200, // 600/day * 2 days
      status: "RETURNED", // so it's eligible for a review
      rentalItems: {
        create: [{ gearItemId: kayak.id, quantity: 1, pricePerDay: 600 }],
      },
    },
  });

  const order4 = await prisma.rentalOrder.create({
    data: {
      customerId: customer2.id,
      providerId: provider1.id,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-03"),
      totalAmount: 400,
      status: "CANCELLED",
      rentalItems: {
        create: [{ gearItemId: roadBike.id, quantity: 1, pricePerDay: 400 }],
      },
    },
  });

  console.log("✅ Rental orders + items created");

  // ─────────────────────────────────────────────
  // 6. Reviews — only valid on a RETURNED order (order3 → kayak)
  //    @@unique([customerId, gearItemId]) means one review per customer per gear
  // ─────────────────────────────────────────────
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Kayak was in great condition, smooth booking process!",
      customerId: customer2.id,
      gearItemId: kayak.id,
    },
  });

  console.log("✅ Reviews created");

  console.log("\n🎉 Seeding complete!\n");
  console.log("Login credentials (all use password: Password123!):");
  console.log(`  Admin:      ${admin.email}`);
  console.log(
    `  Provider 1: ${provider1.email}  (${mountainBike.name}, ${roadBike.name}, ${dumbbellSet.name})`,
  );
  console.log(
    `  Provider 2: ${provider2.email}  (${tent.name}, ${sleepingBag.name}, ${kayak.name})`,
  );
  console.log(`  Customer 1: ${customer1.email}  (orders: CONFIRMED, PLACED)`);
  console.log(
    `  Customer 2: ${customer2.email}  (orders: RETURNED + reviewed, CANCELLED)`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
