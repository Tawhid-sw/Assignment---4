import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { catchAsync } from "@/src/utils/catchAsync";
import { sendResponse } from "@/src/utils/sendResponse";
import httpStatus from "http-status";
import { config } from "@/src/config";
import { jwt_utils } from "@/src/utils/jwt";
import { Role } from "@/generated/prisma/enums";

const registerUser = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await authService.register(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: user,
    });
  },
);

const loginUser = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await authService.login(req.body);

    const { accessToken, refreshToken } = (await authService.login(
      req.body,
    )) as {
      accessToken: string;
      refreshToken: string;
    };

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: user,
    });
  },
);

const userRefreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken } = await authService.refreshToken(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Token Refreshed Successfully",
      data: {
        accessToken,
      },
    });
  },
);

const profile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const email = req.user?.email;

    if (!email) {
      throw new Error("Not authenticated");
    }

    const user = await authService.profile(email);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile retrieved successfully",
      data: user,
    });
  },
);

const updateProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const email = req.user?.email;

    if (!email) {
      throw new Error("Not authenticated");
    }

    const { name, avatarUrl } = req.body;

    const updatedUser = await authService.updateProfile({
      email,
      name,
      avatarUrl,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  },
);
export const authController = {
  registerUser,
  loginUser,
  userRefreshToken,
  profile,
  updateProfile,
};
