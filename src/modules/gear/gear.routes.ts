import express from "express";
import { gearController } from "./gear.controller";
import { auth } from "@/src/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/enums";
import { gearValidation } from "./gear.validation";

const gearRouter = express.Router();

// Public routes
gearRouter.get("/", gearController.allGear);

// Provider routes
gearRouter.get(
  "/provider-inventory",
  auth(Role.PROVIDER),
  gearController.providerInventory,
);

gearRouter.post(
  "/create-new-gear",
  auth(Role.PROVIDER),
  gearValidation.validateCreateGear,
  gearController.createGear,
);

gearRouter.put(
  "/update-gear/:id",
  auth(Role.PROVIDER),
  gearValidation.validateUpdateGear,
  gearController.updateGear,
);

gearRouter.delete(
  "/delete-gear/:id",
  auth(Role.PROVIDER),
  gearValidation.validateGearId,
  gearController.deleteGear,
);

gearRouter.get("/:id", gearController.gearById);

export default gearRouter;
