"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/walletRoutes.ts
const express_1 = require("express");
const walletController_1 = require("../controllers/walletController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// 1) Retorna { balance, cardNumber } para o usuário autenticado
router.get("/:userId/balance", auth_1.verifyToken, walletController_1.getWalletInfo);
// 2) Cria ou atualiza o número do cartão do usuário (até um cartão por usuário)
router.put("/:userId/card", auth_1.verifyToken, walletController_1.updateCardNumber);
// 3) Depósito (continua igual)
router.post("/:userId/deposit", auth_1.verifyToken, walletController_1.deposit);
// 4) Saque (continua igual)
router.post("/:userId/withdraw", auth_1.verifyToken, walletController_1.withdraw);
// 5) Histórico de transações (continua igual)
router.get("/:userId/transactions", auth_1.verifyToken, walletController_1.listWalletTransactions);
exports.default = router;
