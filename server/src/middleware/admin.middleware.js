
import prisma from "../config/prisma.js";

export const requireAdmin = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            },
            select: {
                id: true,
                role: true,
                isActive: true
            }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "User is inactive or not found"
            });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Administrator access required"
            });
        }

        req.admin = user;
        next();
    } catch (error) {
        console.error("Admin authorization error:", error);

        return res.status(500).json({
            message: "Authorization failed"
        });
    }
};
