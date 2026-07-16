import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "@/src/utils/catchAsync";
import { sendResponse } from "@/src/utils/sendResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await adminService.getAllUsers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: users,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = req.body;

  const user = await adminService.updateUserStatus(id, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: user,
  });
});

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const gear = await adminService.getAllGear();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear listings retrieved successfully",
    data: gear,
  });
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const rentals = await adminService.getAllRentals();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental orders retrieved successfully",
    data: rentals,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};
