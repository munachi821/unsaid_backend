import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import {
  getPublicProfile,
  checkUsernameAvailability,
} from "../controllers/usersControllers.js";

const router = express.Router();

router.get("/public/:username", getPublicProfile);
router.get("/check-username", getUserId, checkUsernameAvailability);

export default router;
