import express from "express";
import { auth } from "@/src/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import { rentalController } from "./rental.controller";
import { validateCreateRental } from "./rental.validation";

const rentalRouter = express.Router();

rentalRouter.post(
  "/",
  auth(Role.CUSTOMER),
  validateCreateRental,
  rentalController.createRental,
);

rentalRouter.get("/", auth(Role.CUSTOMER), rentalController.getMyRentals);

rentalRouter.get("/:id", auth(Role.CUSTOMER), rentalController.getRentalById);

export default rentalRouter;
