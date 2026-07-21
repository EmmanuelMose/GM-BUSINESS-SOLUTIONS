import { Router } from "express";
import {
  getAllInquiriesController,
  getUnreadInquiriesController,
  getInquiryByIdController,
  createInquiryController,
  markInquiryReadController,
  replyInquiryController,
  markInquiryResolvedController,
  deleteInquiryController,
  bulkDeleteInquiriesController
} from "./inquiries.controller";

const inquiriesRouter = Router();

inquiriesRouter.post("/", createInquiryController);
inquiriesRouter.get("/", getAllInquiriesController);
inquiriesRouter.get("/unread", getUnreadInquiriesController);
inquiriesRouter.get("/:id", getInquiryByIdController);
inquiriesRouter.patch("/:id/read", markInquiryReadController);
inquiriesRouter.patch("/:id/reply", replyInquiryController);
inquiriesRouter.patch("/:id/resolve", markInquiryResolvedController);
inquiriesRouter.delete("/:id", deleteInquiryController);
inquiriesRouter.post("/bulk-delete", bulkDeleteInquiriesController);

export default inquiriesRouter;