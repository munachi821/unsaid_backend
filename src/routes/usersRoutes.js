import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import {
  getPublicProfile,
  checkUsernameAvailability,
  updateUsername,
  updatePassword,
  updatePrefrences,
} from "../controllers/usersControllers.js";
import { updatePreferencesSchema } from "../validators/userValidators.js";
import { validateRequest } from "../validators/validateRequest.js";

const router = express.Router();

router.get("/public/:username", getPublicProfile);
router.get("/check-username", getUserId, checkUsernameAvailability);
router.patch("/me/username", getUserId, updateUsername);
router.patch("/me/password", getUserId, updatePassword);
router.patch(
  "/me/preferences",
  getUserId,
  validateRequest(updatePreferencesSchema),
  updatePrefrences,
);

export default router;
