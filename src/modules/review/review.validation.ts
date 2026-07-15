import type { Request, Response, NextFunction } from "express";

export const validateCreateReview = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { gearItemId, rating, comment } = req.body;

  if (!gearItemId || typeof gearItemId !== "string") {
    return res.status(400).json({
      success: false,
      message: "gearItemId is required",
      errorDetails: null,
    });
  }

  if (rating === undefined || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "rating must be a number between 1 and 5",
      errorDetails: null,
    });
  }

  if (comment !== undefined && typeof comment !== "string") {
    return res.status(400).json({
      success: false,
      message: "comment must be a string",
      errorDetails: null,
    });
  }

  next();
};
