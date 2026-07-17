import type { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import type { category } from "../../../generated/prisma/client";
import { categoryService } from "./category.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const allCategorys = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const categorys = await categoryService.getAllCategorys();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categorys retrieved successfully",
      data: categorys,
    });
  },
);

const categoryById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: "Category id is required",
        data: null,
      });
    }

    const category = await categoryService.getCategoryById(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category retrieved successfully",
      data: category,
    });
  },
);

const createCategory = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as category;
    if (!payload.name || !payload.slug) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: "All fields are required",
        data: null,
      });
    }
    const category = await categoryService.createNewCategory(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Category created successfully",
      data: category,
    });
  },
);

const updateCategory = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: "Category id is required",
        data: null,
      });
    }

    const payload = req.body as category;
    if (!payload.name || !payload.slug) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: "All fields are required",
        data: null,
      });
    }

    const category = await categoryService.updateCategory(
      id as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category updated successfully",
      data: category,
    });
  },
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: "Category id is required",
        data: null,
      });
    }

    const category = await categoryService.deleteCategory(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category deleted successfully",
      data: category,
    });
  },
);

export const categoryController = {
  allCategorys,
  categoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
