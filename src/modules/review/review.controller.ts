import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "@/src/utils/catchAsync";
import { sendResponse } from "@/src/utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const review = await reviewService.createReview(req.body, customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review created successfully",
    data: review,
  });
});

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

export const reviewController = {
  createReview,
  getReviewsForGear,
};
