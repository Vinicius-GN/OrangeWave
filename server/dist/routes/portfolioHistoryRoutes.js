"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const portfolioHistoryController_1 = require("../controllers/portfolioHistoryController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Cria ou atualiza snapshot diário do portfólio do usuário
// (normalmente chamado por cron job ou manualmente)
router.post("/:userId", auth_1.verifyToken, portfolioHistoryController_1.createSnapshot);
// Lista histórico, filtra por timeframe opcional (?timeframe=1M,1W,6M,1Y)
router.get("/:userId", auth_1.verifyToken, portfolioHistoryController_1.listHistory);
exports.default = router;
