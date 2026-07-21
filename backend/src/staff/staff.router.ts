import { Router } from "express";
import {
  getAllStaffController,
  getStaffByIdController,
  createStaffController,
  deleteStaffController,
  bulkDeleteStaffController
} from "./staff.controller";

const staffRouter = Router();

staffRouter.get("/", getAllStaffController);
staffRouter.get("/:id", getStaffByIdController);
staffRouter.post("/", createStaffController);
staffRouter.delete("/:id", deleteStaffController);
staffRouter.post("/bulk-delete", bulkDeleteStaffController);

export default staffRouter;