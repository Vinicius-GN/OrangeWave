// src/routes/priceRoutes.ts
// Express router for price snapshot endpoints
// Handles listing price snapshots and retrieving the latest snapshot for an asset
import { Router } from "express";
import {
  listPriceSnapshots,
  lastPriceSnapshot,
} from "../controllers/priceController";

const router = Router();
// GET /:assetId - List price snapshots for an asset (optionally filtered by timeframe)
router.get("/:assetId", listPriceSnapshots);
// GET /:assetId/last - Get the latest price snapshot for an asset
router.get("/:assetId/last", lastPriceSnapshot);

export default router;
