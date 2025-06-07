"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assetRoutes_1 = __importDefault(require("./assetRoutes"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const newsRoutes_1 = __importDefault(require("./newsRoutes"));
const orderRoutes_1 = __importDefault(require("./orderRoutes"));
const portfolioRoutes_1 = __importDefault(require("./portfolioRoutes"));
const priceRoutes_1 = __importDefault(require("./priceRoutes"));
const walletRoutes_1 = __importDefault(require("./walletRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const portfolioHistoryRoutes_1 = __importDefault(require("./portfolioHistoryRoutes")); // <— import
const router = (0, express_1.Router)();
router.use("/auth", authRoutes_1.default);
router.use("/assets", assetRoutes_1.default);
router.use("/news", newsRoutes_1.default);
router.use("/orders", orderRoutes_1.default);
router.use("/portfolio", portfolioRoutes_1.default);
router.use("/prices", priceRoutes_1.default);
router.use("/wallet", walletRoutes_1.default);
router.use("/users", userRoutes_1.default);
router.use("/portfolio-history", portfolioHistoryRoutes_1.default); // <— nova rota
exports.default = router;
