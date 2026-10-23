import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import {
  getPublicProfile,
  checkUsernameAvailability,
  updateUsername,
  updatePassword,
  updatePrefrences,
  exportData,
  deleteAccount,
} from "../controllers/usersControllers.js";
import {
  deleteAccountSchema,
  updatePasswordSchema,
  updatePreferencesSchema,
  updateUsernameSchema,
} from "../validators/userValidators.js";
import { validateRequest } from "../validators/validateRequest.js";

const router = express.Router();

router.get("/public/:username", getPublicProfile);
router.get("/check-username", getUserId, checkUsernameAvailability);
router.patch(
  "/me/username",
  getUserId,
  validateRequest(updateUsernameSchema),
  updateUsername,
);
router.patch(
  "/me/password",
  getUserId,
  validateRequest(updatePasswordSchema),
  updatePassword,
);
router.patch(
  "/me/preferences",
  getUserId,
  validateRequest(updatePreferencesSchema),
  updatePrefrences,
);
router.get("/me/export", getUserId, exportData);
router.delete(
  "/me",
  getUserId,
  validateRequest(deleteAccountSchema),
  deleteAccount,
);

export default router;
