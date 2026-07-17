import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";

const createRental = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const order = await rentalService.createRental(req.body, customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order created successfully",
    data: order,
  });
});

const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const orders = await rentalService.getMyRentals(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental orders retrieved successfully",
    data: orders,
  });
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const customerId = req.user!.id;

  const order = await rentalService.getRentalById(id, customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order retrieved successfully",
    data: order,
  });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const orders = await rentalService.getProviderOrders(providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Provider orders retrieved successfully",
    data: orders,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = req.body;
  const providerId = req.user!.id;

  const order = await rentalService.updateOrderStatus(id, providerId, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order status updated successfully",
    data: order,
  });
});

const returnAndReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const customerId = req.user!.id;
  const { reviews } = req.body;

  const result = await rentalService.returnAndReview(id, customerId, reviews);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Items returned and reviewed successfully",
    data: result,
  });
});

export const rentalController = {
  createRental,
  getMyRentals,
  getRentalById,
  getProviderOrders,
  updateOrderStatus,
  returnAndReview,
};
