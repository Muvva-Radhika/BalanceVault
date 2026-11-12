
import express from "express";

import {
    getMyAccounts,
    getAccountById
} from "../controllers/account.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my", authenticate, getMyAccounts);

router.get("/:id", authenticate, getAccountById);

export default router;
