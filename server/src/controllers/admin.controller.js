
import prisma from "../config/prisma.js";

// Get all registered users
export const getAdminUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        accounts: true
                    }
                }
            }
        });

        return res.status(200).json({ users });
    } catch (error) {
        console.error("Get admin users error:", error);
        return res.status(500).json({
            message: "Unable to fetch users"
        });
    }
};

// Get audit logs
export const getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return res.status(200).json({ logs });
    } catch (error) {
        console.error("Get audit logs error:", error);
        return res.status(500).json({
            message: "Unable to fetch audit logs"
        });
    }
};
