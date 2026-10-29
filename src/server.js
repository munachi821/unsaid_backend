import "dotenv/config";
import express from "express";
import { connectDB, disconnectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

//Import Routes
import apiRoutes from "./routes/index.js";
import { initArchiveCron } from "./jobs/archiveCron.js";

connectDB();

if (!process.env.VERCEL) {
  initArchiveCron();
}

const app = express();
app.set("trust proxy", 1);

//Cors setup
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(
  Boolean,
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Unsaid Backend API is running",
  });
});

//API Routes
app.use("/api", apiRoutes);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });

  //Handle unhandled promise rejections (e.g., database connection errors)!
  process.on("unhandledRejection", (err) => {
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
}

export default app;
