"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePortfolioItem = exports.upsertPortfolio = exports.listPortfolio = void 0;
const portifolioAsset_1 = __importDefault(require("../models/portifolioAsset"));
// List all assets in a user's portfolio
const listPortfolio = async (req, res) => {
    try {
        const { userId } = req.params;
        const items = await portifolioAsset_1.default.find({ userId });
        res.json(items);
    }
    catch (err) {
        console.error("Erro ao listar portfólio:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listPortfolio = listPortfolio;
// Add or update an asset in the user's portfolio
const upsertPortfolio = async (req, res) => {
    try {
        const { userId } = req.params;
        const { assetId, symbol, type, quantity, buyPrice } = req.body;
        // Check if the asset already exists in the portfolio
        const existing = await portifolioAsset_1.default.findOne({ userId, assetId });
        if (existing) {
            existing.quantity = quantity;
            existing.buyPrice = buyPrice;
            await existing.save();
            res.json(existing);
            return;
        }
        // Create new portfolio item
        const item = new portifolioAsset_1.default({
            userId,
            assetId,
            symbol,
            type,
            quantity,
            buyPrice,
        });
        await item.save();
        res.status(201).json(item);
    }
    catch (err) {
        console.error("Erro ao inserir/atualizar portfólio:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.upsertPortfolio = upsertPortfolio;
// Delete an asset from the user's portfolio
const deletePortfolioItem = async (req, res) => {
    try {
        const { userId, symbol } = req.params;
        const result = await portifolioAsset_1.default.deleteOne({ userId, symbol });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "Item não encontrado" });
            return;
        }
        res.json({ message: "Item removido do portfólio" });
    }
    catch (err) {
        console.error("Erro ao deletar portfólio:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.deletePortfolioItem = deletePortfolioItem;
