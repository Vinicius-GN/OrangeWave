"use strict";
// Controller for managing portfolio history (daily snapshots of user portfolio value)
// Provides endpoints for creating, updating, and retrieving portfolio value history
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHistory = exports.createSnapshot = void 0;
const portfolioHistory_1 = __importDefault(require("../models/portfolioHistory"));
const portifolioAsset_1 = __importDefault(require("../models/portifolioAsset"));
const priceSnapshot_1 = __importDefault(require("../models/priceSnapshot"));
// Helper to normalize a date to midnight (removes time, keeps only year/month/day)
function normalizeToMidnight(d) {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
}
/**
 * Creates or updates a daily snapshot of the user's total portfolio value.
 * Private endpoint (assumes an external job or the user triggers it)
 * Route: POST /portfolio-history/:userId
 * Body: { date?: string (ISO) }
 */
const createSnapshot = async (req, res) => {
    try {
        const { userId } = req.params;
        // If date is not provided, use today
        const rawDate = req.body.date ? new Date(req.body.date) : new Date();
        const date = normalizeToMidnight(rawDate);
        // Fetch all portfolio assets for this user
        const portfolioItems = await portifolioAsset_1.default.find({ userId });
        // If no assets, total value is 0
        if (!portfolioItems || portfolioItems.length === 0) {
            // Try to create/update with zero value
            await portfolioHistory_1.default.findOneAndUpdate({ userId, date }, { $set: { totalValue: 0 } }, { upsert: true, new: true });
            res.json({ userId, date, totalValue: 0 });
            return;
        }
        // For each asset, get the most recent (daily) price from PriceSnapshot
        let total = 0;
        for (const item of portfolioItems) {
            // Look for the last "day" price for this asset on or before the date
            const snapshot = await priceSnapshot_1.default.findOne({
                assetId: item.assetId,
                timeframe: "day",
                timestamp: { $lte: date }
            })
                .sort({ timestamp: -1 })
                .lean();
            const price = snapshot && typeof snapshot.price === "number" ? snapshot.price : 0;
            total += price * (item.quantity ?? 0);
        }
        // Insert or update document in PortfolioHistory
        const record = await portfolioHistory_1.default.findOneAndUpdate({ userId, date }, { $set: { totalValue: total } }, { upsert: true, new: true });
        res.json(record);
    }
    catch (err) {
        console.error("Erro ao criar snapshot de portfólio:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.createSnapshot = createSnapshot;
/**
 * Lists portfolio snapshots for a user, filtered by timeframe:
 * query param `timeframe` can be: "1W", "1M", "6M", "1Y" or undefined (returns all)
 * Example: GET /portfolio-history/:userId?timeframe=1M
 */
const listHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeframe } = req.query;
        let cutoffDate = null;
        const today = normalizeToMidnight(new Date());
        // Determine cutoff date based on timeframe
        switch (timeframe) {
            case "1W":
                cutoffDate = new Date(today);
                cutoffDate.setDate(today.getDate() - 7);
                break;
            case "1M":
                cutoffDate = new Date(today);
                cutoffDate.setMonth(today.getMonth() - 1);
                break;
            case "6M":
                cutoffDate = new Date(today);
                cutoffDate.setMonth(today.getMonth() - 6);
                break;
            case "1Y":
                cutoffDate = new Date(today);
                cutoffDate.setFullYear(today.getFullYear() - 1);
                break;
            default:
                cutoffDate = null;
        }
        // Build filter for query
        const filter = { userId };
        if (cutoffDate) {
            filter.date = { $gte: cutoffDate, $lte: today };
        }
        // Find and return all matching portfolio history records
        const history = await portfolioHistory_1.default.find(filter)
            .sort({ date: 1 })
            .lean();
        res.json(history);
    }
    catch (err) {
        console.error("Erro ao listar histórico do portfólio:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listHistory = listHistory;
