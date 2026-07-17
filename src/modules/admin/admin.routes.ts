import express from "express";
import { auth } from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";

const adminRouter = express.Router();

adminRouter.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
adminRouter.patch(
  "/users/:id",
  auth(Role.ADMIN),
  adminValidation.validateUserStatusUpdate,
  adminController.updateUserStatus,
);
adminRouter.get("/gear", auth(Role.ADMIN), adminController.getAllGear);
adminRouter.get("/rentals", auth(Role.ADMIN), adminController.getAllRentals);

export default adminRouter;
