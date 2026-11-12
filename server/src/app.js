
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

app.set("trust proxy", 1);

app.set("etag", false);

app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

app.use("/api", limiter);

app.get("/", (req, res) => {
    res.json({
        message: "BalanceVault API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

