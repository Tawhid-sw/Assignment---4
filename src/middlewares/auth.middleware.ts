import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { Role } from "../../generated/prisma/enums";
import { config } from "../config";
import { prisma } from "../lib/prisma";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { jwt_utils } from "../utils/jwt";
import { sendResponse } from "../utils/sendResponse";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "You are not logged in. Please log in to access this route.",
        data: null,
      });
    }

    const verifiedToken = jwt_utils.verifyToken(
      token,
      config.JWT_ACCESS_SECRET!,
    );

    if (!verifiedToken.success) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: verifiedToken.error ?? "Invalid token",

        data: null,
      });
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.FORBIDDEN,
        message: "Forbidden. You don't have permission to access this route.",
        data: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "User not found. Please log in again.",
        data: null,
      });
    }

    if (user.status === "SUSPENDED") {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.LOCKED,
        message: "Your account has been suspended. Please contact support.",
        data: null,
      });
    }

    req.user = {
      email,
      name,
      id,
      role,
    };

    next();
  });
};
