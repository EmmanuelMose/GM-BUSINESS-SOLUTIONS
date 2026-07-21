import { Router } from "express";
import {
  registerUserController,
  verifyUserController,
  loginUserController,
  forgotPasswordController,
  verifyResetCodeController,
  resetPasswordController
} from "./auth.controller";

const authRouter = Router();

authRouter.post("/register", registerUserController);
authRouter.post("/verify", verifyUserController);
authRouter.post("/login", loginUserController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/verify-reset-code", verifyResetCodeController);
authRouter.post("/reset-password", resetPasswordController);

export default authRouter;