import express from "express";
import {
  login,
  register,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authControllers.js";
import { getUserId } from "../middleware/authMiddleware.js";
import {
  SignUpSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/authValidators.js";
import { validateRequest } from "../validators/validateRequest.js";

const router = express.Router();

router.post("/register", validateRequest(SignUpSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);
router.get("/me", getUserId, getMe);
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword,
);

export default router;
