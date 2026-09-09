import express from "express";
import { getUserId } from "../middleware/authMiddleware.js";
import { checkUsername_Exists } from "../controllers/usersControllers.js";

const router = express.Router();

router.get("/public/:username", checkUsername_Exists);

export default router;
