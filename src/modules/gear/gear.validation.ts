import type { Request, Response, NextFunction } from "express";

const validateGearQuery = (req: Request) => {
  const query = req.query as Record<string, string | undefined>;

  return {
    searchTerm:
      typeof query.searchTerm === "string" ? query.searchTerm : undefined,
    category: typeof query.category === "string" ? query.category : undefined,
    brand: typeof query.brand === "string" ? query.brand : undefined,
    minPrice: typeof query.minPrice === "string" ? query.minPrice : undefined,
    maxPrice: typeof query.maxPrice === "string" ? query.maxPrice : undefined,
    available:
      typeof query.available === "string" ? query.available : undefined,
  };
};

const validateCreateGear = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, description, brand, pricePerDay, categorySlug } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      message: "name is required",
      errorDetails: null,
    });
  }

  if (!description || typeof description !== "string") {
    return res.status(400).json({
      success: false,
      message: "description is required",
      errorDetails: null,
    });
  }

  if (!brand || typeof brand !== "string") {
    return res.status(400).json({
      success: false,
      message: "brand is required",
      errorDetails: null,
    });
  }

  if (
    pricePerDay === undefined ||
    typeof pricePerDay !== "number" ||
    pricePerDay <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "pricePerDay must be a positive number",
      errorDetails: null,
    });
  }

  if (!categorySlug || typeof categorySlug !== "string") {
    return res.status(400).json({
      success: false,
      message: "categorySlug is required",
      errorDetails: null,
    });
  }

  next();
};

const validateUpdateGear = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Gear id is required",
      errorDetails: null,
    });
  }

  next();
};

const validateGearId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Gear id is required",
      errorDetails: null,
    });
  }

  next();
};

export const gearValidation = {
  validateGearQuery,
  validateCreateGear,
  validateUpdateGear,
  validateGearId,
};
