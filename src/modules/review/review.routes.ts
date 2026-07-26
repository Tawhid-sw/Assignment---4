import express from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth.middleware";
import { reviewController } from "./review.controller";

const reviewRouter = express.Router();

reviewRouter.get("/gear/:gearItemId", reviewController.getReviewsForGear);
reviewRouter.get(
	"/my-reviews",
	auth(Role.CUSTOMER),
	reviewController.getMyReviews,
);
reviewRouter.get("/:id", reviewController.getReviewById);

export default reviewRouter;
