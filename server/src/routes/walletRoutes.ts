// src/routes/walletRoutes.ts
// Express router for wallet-related endpoints
import { Router } from "express";
import {
  getWalletInfo,           // Returns balance and cardNumber
  updateCardNumber,        // Endpoint to create/update credit card
  deposit,
  withdraw,
  listWalletTransactions,
} from "../controllers/walletController";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// GET /:userId/balance - Get wallet balance and card info for authenticated user
router.get("/:userId/balance", verifyToken, getWalletInfo);

// PUT /:userId/card - Create or update user's credit card number
router.put("/:userId/card", verifyToken, updateCardNumber);

// POST /:userId/deposit - Deposit funds into user's wallet
router.post("/:userId/deposit", verifyToken, deposit);

// POST /:userId/withdraw - Withdraw funds from user's wallet
router.post("/:userId/withdraw", verifyToken, withdraw);

// GET /:userId/transactions - List wallet transaction history
router.get("/:userId/transactions", verifyToken, listWalletTransactions);

export default router;
