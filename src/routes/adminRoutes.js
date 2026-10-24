import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  listAllUsers,
  platformStats,
} from "../controllers/adminControllers.js";

const router = express.Router();

router.use(getUserId, requireAdmin);

router.get("/stats", platformStats);
router.patch("/users", listAllUsers);

export default router;
