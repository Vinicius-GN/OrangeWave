"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/priceRoutes.ts
const express_1 = require("express");
const priceController_1 = require("../controllers/priceController");
const router = (0, express_1.Router)();
router.get("/:assetId", priceController_1.listPriceSnapshots); // ?timeframe=hour
router.get("/:assetId/last", priceController_1.lastPriceSnapshot); // últimos de cada timeframe
exports.default = router;
