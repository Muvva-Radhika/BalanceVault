

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

// ------------------------------------------
// USER ROUTES
// ------------------------------------------

// Submit a new account application
router.post(
    "/",
    authenticate,
    applyForAccount
);

// Get logged-in user's application status
router.get(
    "/me",
    authenticate,
    getMyApplication
);

// ------------------------------------------
// ADMIN ROUTES
// ------------------------------------------

// Get all account applications
router.get(
    "/admin/all",
    authenticate,
    requireAdmin,
    getAllApplications
);

// Approve or reject an application
router.patch(
    "/admin/:id/review",
    authenticate,
    requireAdmin,
    reviewApplication
);

export default router;
