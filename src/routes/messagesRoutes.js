import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { sendMessage } from "../controllers/messagesControllers.js";
import { validateRequest } from "../validators/validateRequest.js";
import { sendMessageSchema } from "../validators/messageValidators.js";

const router = express.Router();

router.post(
  "/send/:username",
  upload.single("img"),
  validateRequest(sendMessageSchema),
  sendMessage,
);

export default router;
