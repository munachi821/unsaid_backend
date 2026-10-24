import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  deleteUser,
  listAllUsers,
  platformStats,
  updateStatus,
} from "../controllers/adminControllers.js";

const router = express.Router();

router.use(getUserId, requireAdmin);

router.get("/stats", platformStats);
router.get("/users", listAllUsers);
router.patch("/users/:id/status", updateStatus);
router.delete("/users/:id", deleteUser);

export default router;
