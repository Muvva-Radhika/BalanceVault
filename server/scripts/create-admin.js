
import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

const createAdmin = async () => {
    try {
        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL?.toLowerCase();
        const password = process.env.ADMIN_PASSWORD;

        if (!name || !email || !password || password.length < 12) {
            throw new Error(
                "Set ADMIN_NAME, ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in .env"
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const admin = await prisma.user.upsert({
            where: { email },
            update: {
                name,
                passwordHash,
                role: "ADMIN",
                isActive: true
            },
            create: {
                name,
                email,
                passwordHash,
                role: "ADMIN"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        console.log("Admin account ready:", admin);
    } catch (error) {
        console.error("Admin creation failed:", error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
};

createAdmin();
