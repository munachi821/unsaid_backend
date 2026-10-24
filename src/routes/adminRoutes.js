import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { platformStats } from "../controllers/adminControllers.js";

const router = express.Router();

router.use(getUserId, requireAdmin);

router.get("/stats", platformStats);

export default router;
