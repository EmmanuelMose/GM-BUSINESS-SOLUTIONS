import { Router } from "express";
import {
  getAllSubscribersController,
  getActiveSubscribersController,
  getSubscriberByIdController,
  subscribeController,
  unsubscribeController,
  deleteSubscriberController,
  bulkDeleteSubscribersController
} from "./subscribers.controller";

const subscribersRouter = Router();

subscribersRouter.post("/subscribe", subscribeController);
subscribersRouter.post("/unsubscribe", unsubscribeController);
subscribersRouter.get("/", getAllSubscribersController);
subscribersRouter.get("/active", getActiveSubscribersController);
subscribersRouter.get("/:id", getSubscriberByIdController);
subscribersRouter.delete("/:id", deleteSubscriberController);
subscribersRouter.post("/bulk-delete", bulkDeleteSubscribersController);

export default subscribersRouter;