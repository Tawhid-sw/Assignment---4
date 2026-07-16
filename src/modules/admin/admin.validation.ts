import type { Request, Response, NextFunction } from "express";

const validateUserStatusUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { status } = req.body;
  const validStatuses = ["ACTIVE", "SUSPENDED"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status must be one of: ${validStatuses.join(", ")}`,
      errorDetails: null,
    });
  }

  next();
};

export const adminValidation = {
  validateUserStatusUpdate,
};
