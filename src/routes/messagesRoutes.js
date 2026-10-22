import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getArchivedMessage,
  getMessageInbox,
  sendMessage,
} from "../controllers/messagesControllers.js";
import { validateRequest } from "../validators/validateRequest.js";
import { sendMessageSchema } from "../validators/messageValidators.js";

const router = express.Router();

router.post(
  "/send/:username",
  upload.single("img"),
  validateRequest(sendMessageSchema),
  sendMessage,
);
router.get("/inbox", getUserId, getMessageInbox);
router.get("/archived", getUserId, getArchivedMessage);

export default router;
