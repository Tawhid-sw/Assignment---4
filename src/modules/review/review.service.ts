import { prisma } from "../../lib/prisma";

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
  getReviewsForGear,
};
