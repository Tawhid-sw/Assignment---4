import express from "express";
import { auth } from "@/src/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";

const reviewRouter = express.Router();

reviewRouter.post(
  "/",
  auth(Role.CUSTOMER),
  reviewValidation.validateCreateReview,
  reviewController.createReview,
);
reviewRouter.get("/gear/:gearItemId", reviewController.getReviewsForGear);

export default reviewRouter;
