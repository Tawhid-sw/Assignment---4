import { prisma } from "@/src/lib/prisma";

const createReview = async (
  payload: { gearItemId: string; rating: number; comment?: string },
  customerId: string,
) => {
  const { gearItemId, rating, comment } = payload;

  const eligibleOrder = await prisma.rentalOrder.findFirst({
    where: {
      customerId,
      status: "RETURNED",
      rentalItems: {
        some: { gearItemId },
      },
    },
  });

  if (!eligibleOrder) {
    throw new Error("You can only review gear you have rented and returned");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      customerId_gearItemId: { customerId, gearItemId },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this gear item");
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      customerId,
      gearItemId,
    },
  });

  return review;
};

const getReviewsForGear = async (gearItemId: string) => {
  return prisma.review.findMany({
    where: { gearItemId },
    include: {
      customer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const reviewService = {
  createReview,
  getReviewsForGear,
};
