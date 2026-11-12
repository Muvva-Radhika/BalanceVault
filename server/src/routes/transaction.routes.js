
import express from "express";

import {
    getMyTransactions,
    deposit,
    withdraw
} from "../controllers/transaction.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my", authenticate, getMyTransactions);

router.post("/:accountId/deposit", authenticate, deposit);

router.post("/:accountId/withdraw", authenticate, withdraw);

export default router;
