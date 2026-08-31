import express from "express";
import {
  login,
  register,
  logout,
  getMe,
} from "../controllers/authControllers.js";
import { getUserId } from "../middleware/authMiddleware.js";
import { SignUpSchema } from "../validators/authValidators.js";
import { validateRequest } from "../validators/validateRequest.js";

const router = express.Router();

router.post("/register", validateRequest(SignUpSchema), register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getUserId, getMe);

export default router;
