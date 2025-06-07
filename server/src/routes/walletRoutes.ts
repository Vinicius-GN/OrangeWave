// src/routes/walletRoutes.ts
import { Router } from "express";
import {
  getWalletInfo,           // agora retorna balance + cardNumber
  updateCardNumber,        // novo endpoint para criar/atualizar cartão
  deposit,
  withdraw,
  listWalletTransactions,
} from "../controllers/walletController";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// 1) Retorna { balance, cardNumber } para o usuário autenticado
router.get("/:userId/balance", verifyToken, getWalletInfo);

// 2) Cria ou atualiza o número do cartão do usuário (até um cartão por usuário)
router.put("/:userId/card", verifyToken, updateCardNumber);

// 3) Depósito (continua igual)
router.post("/:userId/deposit", verifyToken, deposit);

// 4) Saque (continua igual)
router.post("/:userId/withdraw", verifyToken, withdraw);

// 5) Histórico de transações (continua igual)
router.get("/:userId/transactions", verifyToken, listWalletTransactions);

export default router;
