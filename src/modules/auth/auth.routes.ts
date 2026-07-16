import express from "express";
import { authController } from "./auth.controller";
import { auth } from "@/src/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import { authValidation } from "./auth.validation";

const authRouter = express.Router();

authRouter.post(
  "/register",
  authValidation.validateRegister,
  authController.registerUser,
);

authRouter.post(
  "/login",
  authValidation.validateLogin,
  authController.loginUser,
);

authRouter.post("/refresh-token", authController.userRefreshToken);

authRouter.get(
  "/profile",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  authController.profile,
);

authRouter.put(
  "/update-profile",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  authValidation.validateUpdateProfile,
  authController.updateProfile,
);

export default authRouter;
