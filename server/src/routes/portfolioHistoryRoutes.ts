import { Router } from "express";
import { createSnapshot, listHistory } from "../controllers/portfolioHistoryController";
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Cria ou atualiza snapshot diário do portfólio do usuário
// (normalmente chamado por cron job ou manualmente)
router.post("/:userId", verifyToken, createSnapshot);

// Lista histórico, filtra por timeframe opcional (?timeframe=1M,1W,6M,1Y)
router.get("/:userId", verifyToken, listHistory);

export default router;
