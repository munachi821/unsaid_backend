import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";

//Import Routes
import apiRoutes from "./routes/index.js";

config();
connectDB();

const app = express();

//Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//API Routes
app.use("/api", apiRoutes);

const server = app.listen(process.env.PORT, () => {
  console.log("server running");
});

//Handle unhandled promise rejections (e.g., database connection errors)!
process.on("unhandlesRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

//Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

//Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM recieved, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
