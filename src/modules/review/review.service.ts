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

const getReviewById = async (reviewId: string) => {
	const review = await prisma.review.findUnique({
		where: { id: reviewId },
		include: {
			customer: { select: { id: true, name: true } },
			gearItem: { select: { id: true, name: true } },
		},
	});

	if (!review) {
		throw new Error("Review not found");
	}

	return review;
};

const getMyReviews = async (customerId: string) => {
	return prisma.review.findMany({
		where: { customerId },
		include: {
			gearItem: { select: { id: true, name: true, imageUrl: true } },
		},
		orderBy: { createdAt: "desc" },
	});
};

export const reviewService = {
	getReviewsForGear,
	getReviewById,
	getMyReviews,
};
