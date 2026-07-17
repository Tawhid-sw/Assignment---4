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

export const reviewController = {
  getReviewsForGear,
};
