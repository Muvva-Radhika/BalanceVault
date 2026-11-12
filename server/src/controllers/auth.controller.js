

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { randomBytes, createHash } from "node:crypto";

import prisma from "../config/prisma.js";


// -------------------- VALIDATION SCHEMAS --------------------

const registerSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().transform(value => value.toLowerCase()),
    password: z.string().min(8).max(72)
});

const loginSchema = z.object({
    email: z.string().trim().email().transform(value => value.toLowerCase()),
    password: z.string().min(1)
});

const forgotPasswordSchema = z.object({
    email: z.string().trim().email().transform(value => value.toLowerCase())
});

const resetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8).max(72)
});

// -------------------- COOKIE OPTIONS --------------------

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
};
// -------------------- REGISTER --------------------

export const register = async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid registration details",
                errors: parsed.error.flatten()
            });
        }

        const { name, email, password } = parsed.data;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: "USER"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return res.status(201).json({
            message: "Registration successful",
            user
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Registration failed"
        });
    }
};

// -------------------- LOGIN --------------------

export const login = async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Enter a valid email and password"
            });
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, cookieOptions);

        return res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed"
        });
    }
};

// -------------------- LOGOUT --------------------

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/"
    });

    return res.json({
        message: "Logged out successfully"
    });
};

// -------------------- GET CURRENT USER --------------------

export const getCurrentUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "User not found or inactive"
            });
        }

        return res.json({ user });

    } catch (error) {
        console.error("Current user error:", error);

        return res.status(500).json({
            message: "Could not retrieve user"
        });
    }
};

// -------------------- PASSWORD RESET HELPERS --------------------

const hashResetToken = (token) => {
    return createHash("sha256")
        .update(token)
        .digest("hex");
};

// -------------------- FORGOT PASSWORD --------------------

export const forgotPassword = async (req, res) => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Enter a valid email address"
            });
        }

        const { email } = parsed.data;

        const genericMessage =
            "If an account exists with this email, a password reset link will be sent.";

        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Do not reveal whether the email exists.
        if (!user || !user.isActive) {
            return res.json({
                message: genericMessage
            });
        }

        // Generate a secure random token.
        const rawToken = randomBytes(32).toString("hex");

        // Store only the SHA-256 hash in PostgreSQL.
        const tokenHash = hashResetToken(rawToken);

        // Token expires after 15 minutes.
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Remove previous tokens and create a new one.
        await prisma.$transaction([
            prisma.passwordResetToken.deleteMany({
                where: { userId: user.id }
            }),

            prisma.passwordResetToken.create({
                data: {
                    tokenHash,
                    userId: user.id,
                    expiresAt
                }
            })
        ]);

        const resetUrl = process.env.PASSWORD_RESET_URL;

        if (!resetUrl) {
            throw new Error("PASSWORD_RESET_URL is not configured");
        }

        const resetLink =
            `${resetUrl}?token=${encodeURIComponent(rawToken)}`;

        try {
            await sendPasswordResetEmail(
                user.email,
                user.name,
                resetLink
            );

        } catch (emailError) {

            await prisma.passwordResetToken.deleteMany({
                where: { tokenHash }
            });

            throw emailError;
        }

        return res.json({
            message: genericMessage
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Unable to process the password reset request"
        });
    }
};

// -------------------- RESET PASSWORD --------------------

export const resetPassword = async (req, res) => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Enter a valid token and password of at least 8 characters"
            });
        }

        const { token, newPassword } = parsed.data;

        const tokenHash = hashResetToken(token);

        const resetRecord = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: {
                user: {
                    select: {
                        id: true,
                        isActive: true
                    }
                }
            }
        });

        if (
            !resetRecord ||
            resetRecord.expiresAt <= new Date() ||
            !resetRecord.user.isActive
        ) {
            return res.status(400).json({
                message: "Invalid or expired password reset link"
            });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Update the password and consume the token in one transaction.
        await prisma.$transaction(async (tx) => {

            // Recheck token validity inside the transaction.
            const validToken = await tx.passwordResetToken.findFirst({
                where: {
                    id: resetRecord.id,
                    expiresAt: { gt: new Date() }
                }
            });

            if (!validToken) {
                throw new Error("INVALID_OR_EXPIRED_RESET_TOKEN");
            }

            await tx.user.update({
                where: { id: resetRecord.userId },
                data: { passwordHash }
            });

            await tx.passwordResetToken.delete({
                where: { id: resetRecord.id }
            });
        });

        return res.json({
            message: "Password reset successful. You can now log in."
        });

    } catch (error) {

        if (error.message === "INVALID_OR_EXPIRED_RESET_TOKEN") {
            return res.status(400).json({
                message: "Invalid or expired password reset link"
            });
        }

        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Unable to reset password"
        });
    }
};
