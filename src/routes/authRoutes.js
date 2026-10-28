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
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", validateRequest(SignUpSchema), register);
router.post("/login", authLimiter, validateRequest(loginSchema), login);
router.post("/logout", logout);
router.get("/me", getUserId, getMe);
router.post(
  "/forgot-password",
  authLimiter,
  validateRequest(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validateRequest(resetPasswordSchema),
  resetPassword,
);

export default router;
