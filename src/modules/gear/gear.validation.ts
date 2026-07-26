import type { NextFunction, Request, Response } from "express";

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
	const { name, description, brand, pricePerDay, stockQuantity, categorySlug } =
		req.body;

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

	if (
		stockQuantity !== undefined &&
		(typeof stockQuantity !== "number" || stockQuantity < 0)
	) {
		return res.status(400).json({
			success: false,
			message: "stockQuantity must be a non-negative number",
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

	const {
		name,
		description,
		brand,
		pricePerDay,
		stockQuantity,
		isAvailable,
		imageUrl,
	} = req.body;

	if (name !== undefined && typeof name !== "string") {
		return res.status(400).json({
			success: false,
			message: "name must be a string",
			errorDetails: null,
		});
	}

	if (description !== undefined && typeof description !== "string") {
		return res.status(400).json({
			success: false,
			message: "description must be a string",
			errorDetails: null,
		});
	}

	if (brand !== undefined && typeof brand !== "string") {
		return res.status(400).json({
			success: false,
			message: "brand must be a string",
			errorDetails: null,
		});
	}

	if (
		pricePerDay !== undefined &&
		(typeof pricePerDay !== "number" || pricePerDay <= 0)
	) {
		return res.status(400).json({
			success: false,
			message: "pricePerDay must be a positive number",
			errorDetails: null,
		});
	}

	if (
		stockQuantity !== undefined &&
		(typeof stockQuantity !== "number" || stockQuantity < 0)
	) {
		return res.status(400).json({
			success: false,
			message: "stockQuantity must be a non-negative number",
			errorDetails: null,
		});
	}

	if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
		return res.status(400).json({
			success: false,
			message: "isAvailable must be a boolean",
			errorDetails: null,
		});
	}

	if (imageUrl !== undefined && typeof imageUrl !== "string") {
		return res.status(400).json({
			success: false,
			message: "imageUrl must be a string",
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
