import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  archiveMessage,
  deleteAllMessage,
  deleteMessage,
  getArchivedMessage,
  getMessageInbox,
  sendMessage,
  unarchiveMessage,
} from "../controllers/messagesControllers.js";
import { validateRequest } from "../validators/validateRequest.js";
import {
  clearAllMessagesSchema,
  sendMessageSchema,
} from "../validators/messageValidators.js";

const router = express.Router();

router.post(
  "/send/:username",
  upload.single("img"),
  validateRequest(sendMessageSchema),
  sendMessage,
);
router.get("/inbox", getUserId, getMessageInbox);
router.get("/archived", getUserId, getArchivedMessage);
router.patch("/:id/archive", getUserId, archiveMessage);
router.patch("/:id/unarchive", getUserId, unarchiveMessage);
router.delete(
  "/clear-all",
  getUserId,
  validateRequest(clearAllMessagesSchema),
  deleteAllMessage,
);
router.delete("/:id", getUserId, deleteMessage);

export default router;
