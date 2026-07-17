import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import { stripe } from "../../lib/stripe";
import { config } from "../../config";

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

// raw body
const confirmPayment = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Webhook signature verification failed",
      errorDetails: null,
    });
  }

  await paymentService.confirmPayment(event);

  res.status(200).json({ received: true });
};

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
