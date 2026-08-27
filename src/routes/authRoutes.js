import express from "express";

const router = express.Router();

router.get("/auth", (req, res) => {
  res.json({ message: "authenticated" });
});

export default router;
