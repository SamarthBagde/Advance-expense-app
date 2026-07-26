import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

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
    })
);

/**
 * Rate Limiting
 */
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: "Too many requests, please try again later.",
    })
);

/**
 * Body Parser
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/expenses", expenseRoutes);

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
app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
);

export default app;