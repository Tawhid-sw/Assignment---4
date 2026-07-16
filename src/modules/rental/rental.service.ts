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

  // all items must belong to the same provider
  const providerId = gearItems[0]!.providerId;
  for (const gear of gearItems) {
    if (gear.providerId !== providerId) {
      throw new Error("All items in one order must be from the same provider");
    }
  }

  // check stock availability and build order items + total
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
    where: { id: orderId, customerId }, // ownership check
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

export const rentalService = {
  createRental,
  getMyRentals,
  getRentalById,
  getProviderOrders,
  updateOrderStatus,
};
