import express from "express";

import {
    applyForAccount,
    getMyApplication,
    getAllApplications,
    reviewApplication
} from "../controllers/onboarding.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// User routes
router.post("/", authenticate, applyForAccount);
router.get("/me", authenticate, getMyApplication);

// Admin routes
router.get(
    "/admin/all",
    authenticate,
    requireAdmin,
    getAllApplications
);

router.patch(
    "/admin/:id/review",
    authenticate,
    requireAdmin,
    reviewApplication
);

export default router;
