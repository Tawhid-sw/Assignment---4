import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type { gearItem } from "@/generated/prisma/client";
import { catchAsync } from "@/src/utils/catchAsync";
import { sendResponse } from "@/src/utils/sendResponse";
import { gearService } from "./gear.service";
import { gearValidation } from "./gear.validation";

type GearBody = Omit<
  gearItem,
  "id" | "createdAt" | "updatedAt" | "categoryId" | "providerId"
> & {
  categorySlug?: string;
};

const allGear = catchAsync(async (req: Request, res: Response) => {
  const safe = gearValidation.validateGearQuery(req);
  const gearItems = await gearService.allGear(safe);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear retrieved successfully",
    data: gearItems,
  });
});

const gearById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };

  if (!id) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Gear id is required",
      data: null,
    });
  }

  const gear = await gearService.getGearById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear retrieved successfully",
    data: gear,
  });
});

const createGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  if (!providerId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Provider id missing",
      data: null,
    });
  }

  const payload = req.body as GearBody;

  const {
    name,
    description,
    brand,
    pricePerDay,
    stockQuantity,
    isAvailable,
    imageUrl,
    categorySlug,
  } = payload;

  if (!categorySlug || !name || !description || !brand || !pricePerDay) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "All fields are required",
      data: null,
    });
  }

  const newGear = await gearService.newGear(
    {
      name,
      description,
      brand,
      pricePerDay,
      stockQuantity,
      isAvailable,
      imageUrl,
    },
    categorySlug,
    providerId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear created successfully",
    data: newGear,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  if (!providerId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Provider id missing",
      data: null,
    });
  }

  const { id } = req.params as { id?: string };
  if (!id) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Gear id is required",
      data: null,
    });
  }

  const payload = req.body as Partial<GearBody>;

  const updatedGear = await gearService.updateGear(payload, id, providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear updated successfully",
    data: updatedGear,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  if (!providerId) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Provider id missing",
      data: null,
    });
  }

  const { id } = req.params as { id?: string };
  if (!id) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Gear id is required",
      data: null,
    });
  }

  const gear = await gearService.deleteGear(id, providerId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear deleted successfully",
    data: gear,
  });
});

const providerInventory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    if (!providerId) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "Provider id missing",
        data: null,
      });
    }

    const inventory = await gearService.providerInventory(providerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider inventory retrieved successfully",
      data: inventory,
    });
  },
);

export const gearController = {
  allGear,
  gearById,
  createGear,
  updateGear,
  deleteGear,
  providerInventory,
};
