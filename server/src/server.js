
import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
            throw new Error("DATABASE_URL and JWT_SECRET must be configured");
        }

        await prisma.$connect();

        console.log("PostgreSQL connected successfully");

        app.listen(PORT, () => {
            console.log(`BalanceVault server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

startServer();
