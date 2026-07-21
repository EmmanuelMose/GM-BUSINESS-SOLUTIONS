import { Router } from "express";
import {
  getAllUsersController,
  getUserByIdController,
  searchUsersController,
  createUserController,
  updateUserController,
  deleteUserController,
  toggleUserStatusController,
  bulkDeleteUsersController
} from "./users.controller";

const usersRouter = Router();

usersRouter.get("/", getAllUsersController);
usersRouter.get("/search", searchUsersController);
usersRouter.get("/:id", getUserByIdController);
usersRouter.post("/", createUserController);
usersRouter.put("/:id", updateUserController);
usersRouter.delete("/:id", deleteUserController);
usersRouter.patch("/:id/toggle-status", toggleUserStatusController);
usersRouter.post("/bulk-delete", bulkDeleteUsersController);

export default usersRouter;