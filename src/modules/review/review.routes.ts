import express from "express";
import { reviewController } from "./review.controller";

const reviewRouter = express.Router();

reviewRouter.get("/gear/:gearItemId", reviewController.getReviewsForGear);

export default reviewRouter;
