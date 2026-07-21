import { Router } from "express";
import {
  getUserAddressesController,
  getAddressByIdController,
  getDefaultAddressController,
  createAddressController,
  updateAddressController,
  setDefaultAddressController,
  deleteAddressController,
  getAddressSummaryController
} from "./addresses.controller";
import { authenticate } from "../middleware/auth.middleware";

const addressesRouter = Router();

// All routes require authentication (any role)
addressesRouter.use(authenticate);

addressesRouter.get("/", getUserAddressesController);
addressesRouter.get("/default", getDefaultAddressController);
addressesRouter.get("/:id", getAddressByIdController);
addressesRouter.get("/:id/summary", getAddressSummaryController);
addressesRouter.post("/", createAddressController);
addressesRouter.put("/:id", updateAddressController);
addressesRouter.patch("/:id/default", setDefaultAddressController);
addressesRouter.delete("/:id", deleteAddressController);

export default addressesRouter;