"use strict";
/**
 * @file portfolioController.ts
 * @brief Controller for user portfolio management: list, add/update, and delete portfolio items.
 *
 * This file defines controller functions for handling user portfolio operations,
 * including listing, upserting (add or update), and deleting portfolio assets.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePortfolioItem = exports.upsertPortfolio = exports.listPortfolio = void 0;
const portifolioAsset_1 = __importDefault(require("../models/portifolioAsset"));
/**
 * @brief List all assets in a user's portfolio.
 *
 * @param req HTTP request with userId as a URL parameter.
 * @param res HTTP response.
 * @returns Array of portfolio assets for the user.
 */
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
/**
 * @brief Add or update an asset in the user's portfolio.
 *
 * If the asset already exists for the user, its quantity and buy price are updated.
 * Otherwise, a new portfolio item is created.
 *
 * @param req HTTP request with userId as a URL parameter and asset data in the body.
 * @param res HTTP response.
 * @returns The updated or newly created portfolio asset.
 */
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
/**
 * @brief Delete an asset from the user's portfolio.
 *
 * @param req HTTP request with userId and symbol as URL parameters.
 * @param res HTTP response.
 * @returns Success message if deleted, or 404 if the item is not found.
 */
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
