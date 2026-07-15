import express from "express";
import { auth } from "@/src/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import { reviewController } from "./review.controller";
import { validateCreateReview } from "./review.validation";

const reviewRouter = express.Router();

reviewRouter.post(
  "/",
  auth(Role.CUSTOMER),
  validateCreateReview,
  reviewController.createReview,
);
reviewRouter.get("/gear/:gearItemId", reviewController.getReviewsForGear);

export default reviewRouter;
