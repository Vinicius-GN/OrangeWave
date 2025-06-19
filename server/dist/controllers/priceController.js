"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastPriceSnapshot = exports.listPriceSnapshots = void 0;
const priceSnapshot_1 = __importDefault(require("../models/priceSnapshot"));
// List all price snapshots for an asset, optionally filtering by timeframe via query
const listPriceSnapshots = async (req, res) => {
    try {
        const { assetId } = req.params;
        const { timeframe } = req.query; // e.g., ?timeframe=hour
        // Build filter for asset and optional timeframe
        const filter = { assetId };
        if (typeof timeframe === "string") {
            filter.timeframe = timeframe;
        }
        // Find and return all matching price snapshots, most recent first
        const snapshots = await priceSnapshot_1.default.find(filter).sort({ timestamp: -1 });
        res.json(snapshots);
    }
    catch (err) {
        console.error("Erro ao listar price snapshots:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listPriceSnapshots = listPriceSnapshots;
// Return the latest price snapshot for each timeframe for an asset
const lastPriceSnapshot = async (req, res) => {
    try {
        const { assetId } = req.params;
        // Aggregate to get the most recent snapshot for each timeframe
        const result = await priceSnapshot_1.default.aggregate([
            { $match: { assetId } },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$timeframe",
                    timestamp: { $first: "$timestamp" },
                    price: { $first: "$price" },
                },
            },
        ]);
        res.json(result);
    }
    catch (err) {
        console.error("Erro ao buscar último price snapshot:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.lastPriceSnapshot = lastPriceSnapshot;
