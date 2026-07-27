import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";

//Routes
import categoryRouter from "./routes/category.route.js";
import userRouter from "./routes/user.route.js";
import expenseRouter from "./routes/expense.route.js";

const app = express();

/**
 * Security
 */
// app.use(helmet());
// app.use(hpp());

/**
 * CORS
 */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

/**
 * Rate Limiting
 */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
  }),
);

/**
 * Body Parser
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// /**
//  * Compression
//  */
// app.use(compression());

/**
 * Health Check
 */
app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

/**
 * API Routes
 */
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/expense", expenseRouter);

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/**
 * Global Error Handler
 */
// Centralized error handling (now provided by ./middlewares/errorHandler.ts)
// Keep this comment for reference; the actual handler is applied below.
app.use(errorHandler);

export default app;
