import express from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/enums";
import { categoryValidation } from "./category.validation";

const categoryRouter = express.Router();

categoryRouter.get("/", categoryController.allCategorys);

categoryRouter.get("/:id", categoryController.categoryById);

categoryRouter.post(
  "/create-new-category",
  auth(Role.ADMIN),
  categoryValidation.validateCreateCategory,
  categoryController.createCategory,
);

categoryRouter.put(
  "/update-category/:id",
  auth(Role.ADMIN),
  categoryValidation.validateCategoryId,
  categoryValidation.validateUpdateCategory,
  categoryController.updateCategory,
);

categoryRouter.delete(
  "/delete-category/:id",
  auth(Role.ADMIN),
  categoryValidation.validateCategoryId,
  categoryController.deleteCategory,
);

export default categoryRouter;
