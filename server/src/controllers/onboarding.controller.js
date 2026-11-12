
import { z } from "zod";
import prisma from "../config/prisma.js";
import { randomUUID } from "node:crypto";

// -------------------- VALIDATION --------------------

const applicationSchema = z.object({
    accountType: z.enum(["SAVINGS", "CURRENT"]),
    applicationNote: z.string().max(300).optional().default("")
});

const reviewSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    remarks: z.string().max(300).optional().default("")
});

// -------------------- USER: APPLY FOR ACCOUNT --------------------

export const applyForAccount = async (req, res) => {
    try {
        const parsed = applicationSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Please provide a valid account type",
                errors: parsed.error.issues
            });
        }

        const { accountType, applicationNote } = parsed.data;
        const userId = req.user.userId;

        const existing = await prisma.onboarding.findUnique({
            where: { userId }
        });

        if (existing && existing.status !== "REJECTED") {
            return res.status(409).json({
                message: "You already have an active or approved application",
                application: existing
            });
        }

        const application = await prisma.$transaction(async (tx) => {
            let result;

            if (existing) {
                result = await tx.onboarding.update({
                    where: { userId },
                    data: {
                        accountType,
                        applicationNote,
                        status: "PENDING",
                        reviewedById: null,
                        remarks: null
                    }
                });
            } else {
                result = await tx.onboarding.create({
                    data: {
                        userId,
                        accountType,
                        applicationNote,
                        status: "PENDING"
                    }
                });
            }

            await tx.auditLog.create({
                data: {
                    actorId: userId,
                    action: "ACCOUNT_APPLICATION_SUBMITTED",
                    entityType: "Onboarding",
                    entityId: result.id,
                    metadata: { accountType }
                }
            });

            return result;
        });

        return res.status(201).json({
            message: "Account application submitted successfully",
            application
        });

    } catch (error) {
        console.error("Apply for account error:", error);

        return res.status(500).json({
            message: "Unable to submit account application"
        });
    }
};

// -------------------- USER: GET MY APPLICATION --------------------

export const getMyApplication = async (req, res) => {
    try {
        const application = await prisma.onboarding.findUnique({
            where: {
                userId: req.user.userId
            },
            select: {
                id: true,
                accountType: true,
                applicationNote: true,
                status: true,
                remarks: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return res.status(200).json({ application });

    } catch (error) {
        console.error("Get my application error:", error);

        return res.status(500).json({
            message: "Unable to fetch application status"
        });
    }
};

// -------------------- ADMIN: GET ALL APPLICATIONS --------------------

export const getAllApplications = async (req, res) => {
    try {
        const applications = await prisma.onboarding.findMany({
            orderBy: {
                createdAt: "desc"
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true
                    }
                },
                reviewer: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        console.log("Applications found:", applications.length);

        console.log(
            "Application statuses:",
            applications.map((app) => ({
                id: app.id,
                status: app.status,
                userId: app.userId
            }))
        );

        return res.status(200).json({
            applications
        });

    } catch (error) {
        console.error("Get applications error:", error);

        return res.status(500).json({
            message: "Unable to fetch applications"
        });
    }
};

// -------------------- ADMIN: APPROVE OR REJECT --------------------

export const reviewApplication = async (req, res) => {
    try {
        const parsed = reviewSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid review details",
                errors: parsed.error.issues
            });
        }

        const { status, remarks } = parsed.data;
        const applicationId = req.params.id;
        const adminId = req.user.userId;

        console.log("========== APPLICATION REVIEW ==========");
        console.log("Application ID received:", applicationId);
        console.log("Admin ID:", adminId);
        console.log("Requested status:", status);

        const result = await prisma.$transaction(async (tx) => {

            // Find the application
            const application = await tx.onboarding.findUnique({
                where: {
                    id: applicationId
                }
            });

            if (!application) {
                console.log("Application not found:", applicationId);
                throw new Error("APPLICATION_NOT_FOUND");
            }

            console.log("Actual database status:", application.status);

            if (application.status !== "PENDING") {
                throw new Error("APPLICATION_ALREADY_REVIEWED");
            }

            // Update only if the application is still pending
            const updateResult = await tx.onboarding.updateMany({
                where: {
                    id: applicationId,
                    status: "PENDING"
                },
                data: {
                    status,
                    remarks,
                    reviewedById: adminId
                }
            });

            if (updateResult.count !== 1) {
                console.log("Conditional update failed:", updateResult.count);
                throw new Error("APPLICATION_ALREADY_REVIEWED");
            }

            console.log("Application status updated:", status);

            const updatedApplication = await tx.onboarding.findUnique({
                where: {
                    id: applicationId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    reviewer: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });

            let account = null;

            // Create an account only when approved
            if (status === "APPROVED") {

                const accountNumber =
                    "BV" +
                    randomUUID()
                        .replaceAll("-", "")
                        .slice(0, 12)
                        .toUpperCase();

                account = await tx.account.create({
                    data: {
                        ownerId: application.userId,
                        accountNumber,
                        accountType: application.accountType,
                        balance: 0n,
                        currency: "INR",
                        status: "ACTIVE"
                    }
                });

                console.log("Account created successfully:", account.id);
            }

            // Save audit record
            await tx.auditLog.create({
                data: {
                    actorId: adminId,
                    action:
                        status === "APPROVED"
                            ? "ACCOUNT_APPLICATION_APPROVED"
                            : "ACCOUNT_APPLICATION_REJECTED",
                    entityType: "Onboarding",
                    entityId: applicationId,
                    metadata: {
                        status,
                        remarks
                    }
                }
            });

            return {
                application: updatedApplication,
                account
            };
        });

        return res.status(200).json({
            message:
                status === "APPROVED"
                    ? "Application approved successfully"
                    : "Application rejected successfully",

            application: result.application,

            account: result.account
                ? {
                    ...result.account,
                    balance: result.account.balance.toString()
                }
                : null
        });

    } catch (error) {
        console.error("Review application error:", error);

        if (error.message === "APPLICATION_NOT_FOUND") {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        if (error.message === "APPLICATION_ALREADY_REVIEWED") {
            return res.status(409).json({
                message: "Application has already been reviewed"
            });
        }

        return res.status(500).json({
            message: "Unable to review application"
        });
    }
};



