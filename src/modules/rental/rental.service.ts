import type { rentalOrder, OrderStatus } from "@/generated/prisma/client";
import { prisma } from "@/src/lib/prisma";

type RentalItemInput = {
  gearItemId: string;
  quantity: number;
};

type CreateRentalPayload = {
  startDate: string;
  endDate: string;
  items: RentalItemInput[];
};

type ReviewInput = {
  gearItemId: string;
  rating: number;
  comment?: string;
};

type StatusMap = {
  [status: string]: string[];
};

const ALLOWED_TRANSITIONS: StatusMap = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PAID", "CANCELLED"],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};

const createRental = async (
  payload: CreateRentalPayload,
  customerId: string,
): Promise<rentalOrder> => {
  const { startDate, endDate, items } = payload;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  const gearIds = items.map((item) => item.gearItemId);

  const gearItems = await prisma.gearItem.findMany({
    where: { id: { in: gearIds } },
  });

  if (gearItems.length !== gearIds.length) {
    throw new Error("One or more gear items do not exist");
  }

  const providerId = gearItems[0]!.providerId;
  for (const gear of gearItems) {
    if (gear.providerId !== providerId) {
      throw new Error("All items in one order must be from the same provider");
    }
  }

  let totalAmount = 0;
  const rentalItemsData = items.map((item) => {
    const gear = gearItems.find((g) => g.id === item.gearItemId);
    if (!gear) throw new Error("Gear item not found");

    if (!gear.isAvailable) {
      throw new Error(`"${gear.name}" is not currently available`);
    }
    if (gear.stockQuantity < item.quantity) {
      throw new Error(
        `Not enough stock for "${gear.name}". Available: ${gear.stockQuantity}, requested: ${item.quantity}`,
      );
    }

    totalAmount += Number(gear.pricePerDay) * item.quantity * days;

    return {
      gearItemId: gear.id,
      quantity: item.quantity,
      pricePerDay: gear.pricePerDay,
    };
  });

  const newOrder = await prisma.$transaction(async (t) => {
    const order = await t.rentalOrder.create({
      data: {
        customerId,
        providerId,
        startDate: start,
        endDate: end,
        totalAmount,
        status: "PLACED",
        rentalItems: { create: rentalItemsData },
      },
      include: {
        rentalItems: { include: { gearItem: true } },
      },
    });

    for (const item of items) {
      await t.gearItem.update({
        where: { id: item.gearItemId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    return order;
  });

  return newOrder;
};

const getMyRentals = async (customerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      rentalItems: { include: { gearItem: true } },
      provider: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getRentalById = async (orderId: string, customerId: string) => {
  const order = await prisma.rentalOrder.findFirst({
    where: { id: orderId, customerId },
    include: {
      rentalItems: { include: { gearItem: true } },
      provider: { select: { id: true, name: true } },
      payment: true,
    },
  });

  if (!order) {
    throw new Error("Rental order not found");
  }

  return order;
};

const getProviderOrders = async (providerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { providerId },
    include: {
      rentalItems: { include: { gearItem: true } },
      customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateOrderStatus = async (
  orderId: string,
  providerId: string,
  newStatus: OrderStatus,
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Rental order not found");
  }

  if (order.providerId !== providerId) {
    throw new Error("You are not authorized to update this order");
  }

  const allowedNextSteps = ALLOWED_TRANSITIONS[order.status] || [];

  if (!allowedNextSteps.includes(newStatus)) {
    throw new Error(
      `Cannot move order from "${order.status}" to "${newStatus}". Allowed: ${
        allowedNextSteps.join(", ") || "none"
      }`,
    );
  }

  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  return updatedOrder;
};

// RETURN + REVIEW together — atomic transaction
const returnAndReview = async (
  orderId: string,
  customerId: string,
  reviews: ReviewInput[],
) => {
  const order = await prisma.rentalOrder.findFirst({
    where: { id: orderId, customerId },
    include: {
      payment: true,
      rentalItems: { include: { gearItem: true } },
    },
  });

  if (!order) {
    throw new Error("Rental order not found");
  }

  if (!order.payment || order.payment.status !== "COMPLETED") {
    throw new Error("Order must be paid before it can be returned");
  }

  if (order.status !== "PICKED_UP") {
    throw new Error(
      `Cannot return order from "${order.status}". Order must be PICKED_UP first.`,
    );
  }
  const orderGearIds = order.rentalItems.map((ri) => ri.gearItemId);

  if (!Array.isArray(reviews) || reviews.length === 0) {
    throw new Error("At least one review is required when returning items");
  }

  for (const review of reviews) {
    if (!orderGearIds.includes(review.gearItemId)) {
      throw new Error(
        `Gear item "${review.gearItemId}" is not part of this rental order`,
      );
    }
    if (review.rating < 1 || review.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
  }

  // Check for duplicate reviews
  const existingReviews = await prisma.review.findMany({
    where: {
      customerId,
      gearItemId: { in: reviews.map((r) => r.gearItemId) },
    },
  });

  if (existingReviews.length > 0) {
    const reviewedIds = existingReviews.map((r) => r.gearItemId).join(", ");
    throw new Error(`You have already reviewed: ${reviewedIds}`);
  }

  const result = await prisma.$transaction(async (t) => {
    for (const item of order.rentalItems) {
      await t.gearItem.update({
        where: { id: item.gearItemId },
        data: { stockQuantity: { increment: item.quantity } },
      });
    }

    const updatedOrder = await t.rentalOrder.update({
      where: { id: orderId },
      data: { status: "RETURNED" },
      include: {
        rentalItems: { include: { gearItem: true } },
        provider: { select: { id: true, name: true } },
      },
    });

    const createdReviews = await Promise.all(
      reviews.map((review) =>
        t.review.create({
          data: {
            rating: review.rating,
            comment: review.comment,
            customerId,
            gearItemId: review.gearItemId,
          },
        }),
      ),
    );

    return { order: updatedOrder, reviews: createdReviews };
  });

  return result;
};

export const rentalService = {
  createRental,
  getMyRentals,
  getRentalById,
  getProviderOrders,
  updateOrderStatus,
  returnAndReview,
};
