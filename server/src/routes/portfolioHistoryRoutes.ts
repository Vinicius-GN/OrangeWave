// Express router for portfolio history endpoints
// Handles creating/updating daily snapshots and listing portfolio value history
import { Router } from "express";
import { createSnapshot, listHistory } from "../controllers/portfolioHistoryController";
import { verifyToken } from "../middlewares/auth";

const router = Router();
// POST /:userId - Create or update daily portfolio snapshot (usually called by cron job or manually)
router.post("/:userId", verifyToken, createSnapshot);
// GET /:userId - List portfolio value history, optionally filtered by timeframe (?timeframe=1M,1W,6M,1Y)
router.get("/:userId", verifyToken, listHistory);

export default router;
