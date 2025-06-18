"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/portfolioRoutes.ts
const express_1 = require("express");
const portfolioController_1 = require("../controllers/portfolioController");
const auth_1 = require("../middlewares/auth");
// Express router for portfolio management endpoints
// Handles listing, updating, and deleting portfolio items for a user
const router = (0, express_1.Router)();
// GET /:userId - List all assets in the user's portfolio
router.get("/:userId", auth_1.verifyToken, portfolioController_1.listPortfolio);
// POST /:userId - Add or update an asset in the user's portfolio
router.post("/:userId", auth_1.verifyToken, portfolioController_1.upsertPortfolio);
// DELETE /:userId/:symbol - Remove an asset from the user's portfolio
router.delete("/:userId/:symbol", auth_1.verifyToken, portfolioController_1.deletePortfolioItem);
exports.default = router;
