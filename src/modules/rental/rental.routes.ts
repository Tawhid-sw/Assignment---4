import express from "express";
import { auth } from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/enums";
import { rentalController } from "./rental.controller";
import { rentalValidation } from "./rental.validation";

const rentalRouter = express.Router();

rentalRouter.post(
  "/",
  auth(Role.CUSTOMER),
  rentalValidation.validateCreateRental,
  rentalController.createRental,
);

rentalRouter.get("/", auth(Role.CUSTOMER), rentalController.getMyRentals);

rentalRouter.get("/:id", auth(Role.CUSTOMER), rentalController.getRentalById);

rentalRouter.patch(
  "/:id/return",
  auth(Role.CUSTOMER),
  rentalValidation.validateReturnAndReview,
  rentalController.returnAndReview,
);

export default rentalRouter;
