

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// Disable ETag-based caching for API responses
app.set("etag", false);

// Prevent browser caching of API responses
app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        service: "BalanceVault API"
    });
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
