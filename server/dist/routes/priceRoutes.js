"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/priceRoutes.ts
// Express router for price snapshot endpoints
// Handles listing price snapshots and retrieving the latest snapshot for an asset
const express_1 = require("express");
const priceController_1 = require("../controllers/priceController");
const router = (0, express_1.Router)();
// GET /:assetId - List price snapshots for an asset (optionally filtered by timeframe)
router.get("/:assetId", priceController_1.listPriceSnapshots);
// GET /:assetId/last - Get the latest price snapshot for an asset
router.get("/:assetId/last", priceController_1.lastPriceSnapshot);
exports.default = router;
