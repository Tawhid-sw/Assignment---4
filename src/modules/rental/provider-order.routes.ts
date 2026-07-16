import express from "express";
import { auth } from "@/src/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import { rentalController } from "../rental/rental.controller";
import { rentalValidation } from "../rental/rental.validation";

const providerOrderRouter = express.Router();

providerOrderRouter.get(
  "/",
  auth(Role.PROVIDER),
  rentalController.getProviderOrders,
);

providerOrderRouter.patch(
  "/:id",
  auth(Role.PROVIDER),
  rentalValidation.validateStatusUpdate,
  rentalController.updateOrderStatus,
);

export default providerOrderRouter;
