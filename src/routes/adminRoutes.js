import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(getUserId, requireAdmin);

export default router;
