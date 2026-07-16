import type { Request, Response, NextFunction } from "express";

const validateCreateRental = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { startDate, endDate, items } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "startDate and endDate are required",
      errorDetails: null,
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({
      success: false,
      message: "startDate and endDate must be valid dates",
      errorDetails: null,
    });
  }

  if (start >= end) {
    return res.status(400).json({
      success: false,
      message: "endDate must be after startDate",
      errorDetails: null,
    });
  }

  const today = new Date(new Date().toDateString());
  if (start < today) {
    return res.status(400).json({
      success: false,
      message: "startDate cannot be in the past",
      errorDetails: null,
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "items must be a non-empty array",
      errorDetails: null,
    });
  }

  for (const item of items) {
    if (!item.gearItemId || typeof item.gearItemId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Each item must have a valid gearItemId",
        errorDetails: null,
      });
    }
    if (!item.quantity || item.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Each item must have a quantity of at least 1",
        errorDetails: null,
      });
    }
  }

  next();
};

const validateStatusUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { status } = req.body;
  const validStatuses = [
    "CONFIRMED",
    "PAID",
    "PICKED_UP",
    "RETURNED",
    "CANCELLED",
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status must be one of: ${validStatuses.join(", ")}`,
      errorDetails: null,
    });
  }

  next();
};

export const rentalValidation = {
  validateCreateRental,
  validateStatusUpdate,
};
