"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Express router for portfolio history endpoints
// Handles creating/updating daily snapshots and listing portfolio value history
const express_1 = require("express");
const portfolioHistoryController_1 = require("../controllers/portfolioHistoryController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// POST /:userId - Create or update daily portfolio snapshot (usually called by cron job or manually)
router.post("/:userId", auth_1.verifyToken, portfolioHistoryController_1.createSnapshot);
// GET /:userId - List portfolio value history, optionally filtered by timeframe (?timeframe=1M,1W,6M,1Y)
router.get("/:userId", auth_1.verifyToken, portfolioHistoryController_1.listHistory);
exports.default = router;
