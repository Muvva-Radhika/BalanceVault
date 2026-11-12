
import express from "express";

import {
    getAdminUsers,
    getAuditLogs
} from "../controllers/admin.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// All routes below require an authenticated administrator
router.use(authenticate, requireAdmin);

router.get("/users", getAdminUsers);
router.get("/audit-logs", getAuditLogs);

export default router;
