import type { Request, Response, NextFunction } from "express";

const validateCreateCategory = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, slug } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      message: "name is required",
      errorDetails: null,
    });
  }

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({
      success: false,
      message: "slug is required",
      errorDetails: null,
    });
  }

  next();
};

const validateUpdateCategory = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, slug } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      message: "name is required",
      errorDetails: null,
    });
  }

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({
      success: false,
      message: "slug is required",
      errorDetails: null,
    });
  }

  next();
};

const validateCategoryId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Category id is required",
      errorDetails: null,
    });
  }

  next();
};

export const categoryValidation = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
};
