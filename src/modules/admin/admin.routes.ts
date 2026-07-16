import express from "express";
import { auth } from "@/src/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import { adminController } from "./admin.controller";
import { validateUserStatusUpdate } from "./admin.validation";

const adminRouter = express.Router();

adminRouter.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
adminRouter.patch(
  "/users/:id",
  auth(Role.ADMIN),
  validateUserStatusUpdate,
  adminController.updateUserStatus,
);
adminRouter.get("/gear", auth(Role.ADMIN), adminController.getAllGear);
adminRouter.get("/rentals", auth(Role.ADMIN), adminController.getAllRentals);

export default adminRouter;
