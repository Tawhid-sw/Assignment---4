import type { Request } from "express";

export const validateGearQuery = (req: Request) => {
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
