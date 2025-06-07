"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/portfolioRoutes.ts
const express_1 = require("express");
const portfolioController_1 = require("../controllers/portfolioController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/:userId", auth_1.verifyToken, portfolioController_1.listPortfolio);
router.post("/:userId", auth_1.verifyToken, portfolioController_1.upsertPortfolio);
router.delete("/:userId/:symbol", auth_1.verifyToken, portfolioController_1.deletePortfolioItem);
exports.default = router;
