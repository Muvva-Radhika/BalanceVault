
import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";

import app from "./app.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 5000;

const createAdminAccount = async () => {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
        throw new Error(
            "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be configured"
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.upsert({
        where: { email },
        create: {
            name,
            email,
            passwordHash,
            role: "ADMIN",
            isActive: true
        },
        update: {
            name,
            passwordHash,
            role: "ADMIN",
            isActive: true
        }
    });

    console.log("Admin account configured successfully");
};

const startServer = async () => {
    try {
        if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
            throw new Error(
                "DATABASE_URL and JWT_SECRET must be configured"
            );
        }

        await prisma.$connect();

        console.log("PostgreSQL connected successfully");

        await createAdminAccount();

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

