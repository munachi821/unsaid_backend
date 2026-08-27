import express from "express";
import { config } from "dotenv";

//Import Routes
import authRoutes from "./routes/authRoutes.js";

config();

const app = express();

//API Routes
app.use("/api", authRoutes);

/* app.get("/api", (req, res) => {
  res.json({ message: "The unsaid backend" });
}); */

const server = app.listen(process.env.PORT, () => {
  console.log("server running");
});
