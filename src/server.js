import express from "express";
import { config } from "dotenv";

//Import Routes
import apiRoutes from "./routes/index.js";

config();

const app = express();

//API Routes
app.use("/api", apiRoutes);

const server = app.listen(process.env.PORT, () => {
  console.log("server running");
});
