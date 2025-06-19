"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
const portifolioAsset_1 = __importDefault(require("../models/portifolioAsset"));
const assets_1 = __importDefault(require("../models/assets"));
const list = async (req, res) => {
    const portfolio = await portifolioAsset_1.default.find({ userId: req.user.id });
    // agrega valor atual
    const enriched = await Promise.all(portfolio.map(async (p) => {
        const asset = await assets_1.default.findById(p.assetId);
        const currentValue = (asset?.price ?? 0) * p.quantity;
        return { ...p.toObject(), currentPrice: asset?.price, currentValue };
    }));
    res.json(enriched);
};
exports.list = list;
