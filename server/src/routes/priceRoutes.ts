// src/routes/priceRoutes.ts
import { Router } from "express";
import {
  listPriceSnapshots,
  lastPriceSnapshot,
} from "../controllers/priceController";

const router = Router();
router.get("/:assetId", listPriceSnapshots);              // ?timeframe=hour
router.get("/:assetId/last", lastPriceSnapshot);           // últimos de cada timeframe

export default router;
