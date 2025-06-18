"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/walletRoutes.ts
// Express router for wallet-related endpoints
const express_1 = require("express");
const walletController_1 = require("../controllers/walletController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// GET /:userId/balance - Get wallet balance and card info for authenticated user
router.get("/:userId/balance", auth_1.verifyToken, walletController_1.getWalletInfo);
// PUT /:userId/card - Create or update user's credit card number
router.put("/:userId/card", auth_1.verifyToken, walletController_1.updateCardNumber);
// POST /:userId/deposit - Deposit funds into user's wallet
router.post("/:userId/deposit", auth_1.verifyToken, walletController_1.deposit);
// POST /:userId/withdraw - Withdraw funds from user's wallet
router.post("/:userId/withdraw", auth_1.verifyToken, walletController_1.withdraw);
// GET /:userId/transactions - List wallet transaction history
router.get("/:userId/transactions", auth_1.verifyToken, walletController_1.listWalletTransactions);
exports.default = router;
