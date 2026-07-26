import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const getReviewsForGear = catchAsync(async (req: Request, res: Response) => {
	const { gearItemId } = req.params as { gearItemId: string };
	const reviews = await reviewService.getReviewsForGear(gearItemId);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Reviews retrieved successfully",
		data: reviews,
	});
});

const getReviewById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const review = await reviewService.getReviewById(id);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Review retrieved successfully",
		data: review,
	});
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
	const customerId = req.user!.id;
	const reviews = await reviewService.getMyReviews(customerId);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "My reviews retrieved successfully",
		data: reviews,
	});
});

export const reviewController = {
	getReviewsForGear,
	getReviewById,
	getMyReviews,
};
