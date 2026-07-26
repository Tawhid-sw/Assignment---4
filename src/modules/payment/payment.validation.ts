import type { NextFunction, Request, Response } from "express";

const validateCreatePayment = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const { rentalOrderId } = req.body;

	if (!rentalOrderId || typeof rentalOrderId !== "string") {
		return res.status(400).json({
			success: false,
			message: "rentalOrderId is required",
			errorDetails: null,
		});
	}

	next();
};

export const paymentValidation = {
	validateCreatePayment,
};
