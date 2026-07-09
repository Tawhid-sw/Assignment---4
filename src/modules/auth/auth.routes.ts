import express from "express";
import { authController } from "./auth.controller";
import { auth } from "@/src/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";

const authRouter = express.Router();

authRouter.post("/register", authController.registerUser);

authRouter.post("/login", authController.loginUser);

authRouter.post("/refresh-token", authController.userRefreshToken);

authRouter.get("/profile", auth(Role.ADMIN), authController.profile);

authRouter.put(
  "/update-profile",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  authController.updateProfile,
);

export default authRouter;
