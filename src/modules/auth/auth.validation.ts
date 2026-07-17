import type { Request, Response, NextFunction } from "express";
import { Role } from "../../../generated/prisma/enums";

const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      message: "name is required",
      errorDetails: null,
    });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
      message: "email is required",
      errorDetails: null,
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "password must be at least 6 characters",
      errorDetails: null,
    });
  }

  if (role === Role.ADMIN) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to register as ADMIN",
      errorDetails: null,
    });
  }

  next();
};

const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
      message: "email is required",
      errorDetails: null,
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "password is required",
      errorDetails: null,
    });
  }

  next();
};

const validateUpdateProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, avatarUrl } = req.body;

  if (!name && !avatarUrl) {
    return res.status(400).json({
      success: false,
      message: "At least one of name or avatarUrl is required",
      errorDetails: null,
    });
  }

  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({
      success: false,
      message: "name must be a string",
      errorDetails: null,
    });
  }

  if (avatarUrl !== undefined && typeof avatarUrl !== "string") {
    return res.status(400).json({
      success: false,
      message: "avatarUrl must be a string",
      errorDetails: null,
    });
  }

  next();
};

export const authValidation = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
};
