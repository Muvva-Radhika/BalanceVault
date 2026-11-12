

import prisma from "../config/prisma.js";

// Convert BigInt balance into a string before sending JSON
const serializeAccount = (account) => ({
    ...account,
    balance: account.balance.toString()
});

// GET /api/accounts/my
// Fetch all accounts belonging to the logged-in user
export const getMyAccounts = async (req, res) => {
    try {
        console.log("========== GET MY ACCOUNTS ==========");
        console.log("Logged-in user ID:", req.user.userId);

        const accounts = await prisma.account.findMany({
            where: {
                ownerId: req.user.userId
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                accountNumber: true,
                accountType: true,
                balance: true,
                currency: true,
                status: true,
                createdAt: true
            }
        });

        console.log("Accounts found:", accounts.length);

        // Prepare the response
        const responseData = {
            accounts: accounts.map(serializeAccount)
        };

        console.log(
            "Accounts being sent:",
            responseData.accounts.length
        );

        console.log("Account response prepared successfully");
        console.log("====================================");

        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Get accounts error:", error);

        return res.status(500).json({
            message: "Could not retrieve accounts"
        });
    }
};

// GET /api/accounts/:id
// Fetch one account belonging to the logged-in user
export const getAccountById = async (req, res) => {
    try {
        console.log("========== GET ACCOUNT BY ID ==========");
        console.log("Fetching account ID:", req.params.id);
        console.log("Logged-in user ID:", req.user.userId);

        const account = await prisma.account.findFirst({
            where: {
                id: req.params.id,
                ownerId: req.user.userId
            },
            select: {
                id: true,
                accountNumber: true,
                accountType: true,
                balance: true,
                currency: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!account) {
            console.log("Account not found");

            return res.status(404).json({
                message: "Account not found"
            });
        }

        console.log("Account found successfully");

        return res.status(200).json({
            account: serializeAccount(account)
        });

    } catch (error) {
        console.error("Get account error:", error);

        return res.status(500).json({
            message: "Could not retrieve account"
        });
    }
};
