import express from "express";

import {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
