import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import {
  getPublicProfile,
  checkUsernameAvailability,
  updateUsername,
  updatePassword,
} from "../controllers/usersControllers.js";

const router = express.Router();

router.get("/public/:username", getPublicProfile);
router.get("/check-username", getUserId, checkUsernameAvailability);
router.patch("/me/username", getUserId, updateUsername);
router.patch("/me/password", getUserId, updatePassword);

export default router;
