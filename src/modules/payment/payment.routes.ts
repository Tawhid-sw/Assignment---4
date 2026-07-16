import express from "express";
import { auth } from "@/src/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const paymentRouter = express.Router();

paymentRouter.post(
  "/create",
  auth(Role.CUSTOMER),
  paymentValidation.validateCreatePayment,
  paymentController.createPayment,
);

// raw data
paymentRouter.post("/confirm", paymentController.confirmPayment);

paymentRouter.get("/", auth(Role.CUSTOMER), paymentController.getMyPayments);
paymentRouter.get(
  "/:id",
  auth(Role.CUSTOMER),
  paymentController.getPaymentById,
);

export default paymentRouter;
