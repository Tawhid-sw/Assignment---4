import type { Request, Response } from "express";
import httpStatus from "http-status";
import { config } from "../../config";
import { stripe } from "../../lib/stripe";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
	const customerId = req.user!.id;
	const { rentalOrderId } = req.body;

	const result = await paymentService.createPayment(rentalOrderId, customerId);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Payment created successfully",
		data: result,
	});
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body as Buffer;
	const signature = req.headers["stripe-signature"] as string;

	const event = stripe.webhooks.constructEvent(
		payload,
		signature,
		config.STRIPE_WEBHOOK_SECRET as string,
	);

	await paymentService.confirmPayment(event);

	sendResponse(res, {
		success: true,
		statusCode: 200,
		message: "Webhook triggered successfully",
		data: null,
	});
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
	const customerId = req.user!.id;
	const payments = await paymentService.getMyPayments(customerId);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Payment history retrieved successfully",
		data: payments,
	});
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const customerId = req.user!.id;

	const payment = await paymentService.getPaymentById(id, customerId);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Payment details retrieved successfully",
		data: payment,
	});
});

export const paymentController = {
	createPayment,
	confirmPayment,
	getMyPayments,
	getPaymentById,
};
