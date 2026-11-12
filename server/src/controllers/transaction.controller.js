
import { randomUUID } from "crypto";
import { z } from "zod";
import prisma from "../config/prisma.js";

const transactionSchema = z.object({
    amount: z.string().regex(
        /^(0|[1-9]\d{0,9})(\.\d{1,2})?$/,
        "Enter a valid amount with up to two decimal places"
    ),
    description: z.string().trim().max(200).optional()
});

const toPaise = (amount) => {
    const [rupees, fraction = ""] = amount.split(".");
    return BigInt(rupees) * 100n + BigInt((fraction + "00").slice(0, 2));
};

const serializeTransaction = (transaction) => ({
    ...transaction,
    amount: transaction.amount.toString(),
    account: transaction.account
        ? {
            ...transaction.account,
            balance: transaction.account.balance?.toString()
        }
        : undefined
});

// GET /api/transactions/my
export const getMyTransactions = async (req, res) => {
    try {
        const transactions = await prisma.ledgerEntry.findMany({
            where: {
                account: {
                    ownerId: req.user.userId
                }
            },
            include: {
                account: {
                    select: {
                        id: true,
                        accountNumber: true,
                        accountType: true,
                        balance: true,
                        currency: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 100
        });

        return res.json({
            transactions: transactions.map(serializeTransaction)
        });
    } catch (error) {
        console.error("Get transactions error:", error);

        return res.status(500).json({
            message: "Could not retrieve transactions"
        });
    }
};

// POST /api/transactions/:accountId/deposit
export const deposit = async (req, res) => {
    try {
        const parsed = transactionSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid transaction details",
                errors: parsed.error.flatten()
            });
        }

        const amount = toPaise(parsed.data.amount);

        if (amount <= 0n) {
            return res.status(400).json({
                message: "Amount must be greater than zero"
            });
        }

        const account = await prisma.account.findFirst({
            where: {
                id: req.params.accountId,
                ownerId: req.user.userId,
                status: "ACTIVE"
            }
        });

        if (!account) {
            return res.status(404).json({
                message: "Active account not found"
            });
        }

        const referenceId = randomUUID();

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.account.update({
                where: {
                    id: account.id
                },
                data: {
                    balance: {
                        increment: amount
                    }
                }
            });

            const entry = await tx.ledgerEntry.create({
                data: {
                    accountId: account.id,
                    type: "CREDIT",
                    amount,
                    referenceId,
                    description: parsed.data.description || "Demo deposit"
                }
            });

            return { updated, entry };
        });

        return res.status(201).json({
            message: "Deposit successful",
            transaction: serializeTransaction({
                ...result.entry,
                account: {
                    accountNumber: account.accountNumber,
                    accountType: account.accountType,
                    balance: result.updated.balance
                }
            })
        });
    } catch (error) {
        console.error("Deposit error:", error);

        return res.status(500).json({
            message: "Deposit failed"
        });
    }
};

// POST /api/transactions/:accountId/withdraw
export const withdraw = async (req, res) => {
    try {
        const parsed = transactionSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid transaction details",
                errors: parsed.error.flatten()
            });
        }

        const amount = toPaise(parsed.data.amount);

        if (amount <= 0n) {
            return res.status(400).json({
                message: "Amount must be greater than zero"
            });
        }

        const account = await prisma.account.findFirst({
            where: {
                id: req.params.accountId,
                ownerId: req.user.userId,
                status: "ACTIVE"
            }
        });

        if (!account) {
            return res.status(404).json({
                message: "Active account not found"
            });
        }

        const referenceId = randomUUID();

        const result = await prisma.$transaction(async (tx) => {
            // Conditional update prevents a negative balance, even
            // when two withdrawals are submitted close together.
            const updatedCount = await tx.account.updateMany({
                where: {
                    id: account.id,
                    ownerId: req.user.userId,
                    status: "ACTIVE",
                    balance: {
                        gte: amount
                    }
                },
                data: {
                    balance: {
                        decrement: amount
                    }
                }
            });

            if (updatedCount.count !== 1) {
                throw new Error("INSUFFICIENT_BALANCE");
            }

            const updated = await tx.account.findUnique({
                where: { id: account.id }
            });

            const entry = await tx.ledgerEntry.create({
                data: {
                    accountId: account.id,
                    type: "DEBIT",
                    amount,
                    referenceId,
                    description: parsed.data.description || "Demo withdrawal"
                }
            });

            return { updated, entry };
        });

        return res.status(201).json({
            message: "Withdrawal successful",
            transaction: serializeTransaction({
                ...result.entry,
                account: {
                    accountNumber: account.accountNumber,
                    accountType: account.accountType,
                    balance: result.updated.balance
                }
            })
        });
    } catch (error) {
        if (error.message === "INSUFFICIENT_BALANCE") {
            return res.status(400).json({
                message: "Insufficient account balance"
            });
        }

        console.error("Withdrawal error:", error);

        return res.status(500).json({
            message: "Withdrawal failed"
        });
    }
};
