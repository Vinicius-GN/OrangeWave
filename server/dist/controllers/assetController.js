"use strict";
/**
 * @file assetController.ts
 * @brief Controller for asset management: list, get, create, update, and delete assets.
 *
 * This file defines controller functions for handling asset operations,
 * including listing all assets, getting an asset by ID or symbol,
 * creating new assets, updating existing assets, and deleting assets.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAsset = exports.updateAsset = exports.createAsset = exports.getAsset = exports.listAssets = void 0;
const assets_1 = __importDefault(require("../models/assets"));
/**
 * @brief List all assets.
 *
 * @param _req HTTP request (unused).
 * @param res HTTP response.
 * @returns Array of all assets.
 */
const listAssets = async (_req, res) => {
    try {
        const assets = await assets_1.default.find();
        res.json(assets);
    }
    catch (err) {
        console.error("Erro ao listar assets:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listAssets = listAssets;
/**
 * @brief Get a single asset by its ID or symbol.
 *
 * Tries to find the asset first by _id, then by symbol.
 *
 * @param req HTTP request with identifier (asset _id or symbol) as a URL parameter.
 * @param res HTTP response.
 * @returns The requested asset or 404 if not found.
 */
const getAsset = async (req, res) => {
    try {
        const { identifier } = req.params;
        // Try to find asset by _id
        let asset = await assets_1.default.findById(identifier);
        // If not found, try by symbol
        if (!asset) {
            asset = await assets_1.default.findOne({ symbol: identifier });
        }
        if (!asset) {
            res.status(404).json({ message: "Asset não encontrado" });
            return;
        }
        res.json(asset);
    }
    catch (err) {
        console.error("Erro ao obter asset:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.getAsset = getAsset;
/**
 * @brief Create a new asset.
 *
 * Checks for duplicate asset symbol before creation.
 *
 * @param req HTTP request containing asset details in the body.
 * @param res HTTP response.
 * @returns The newly created asset or an error if already exists.
 */
const createAsset = async (req, res) => {
    try {
        const payload = req.body;
        // Check if asset with the same symbol already exists
        const exists = await assets_1.default.findOne({ symbol: payload.symbol });
        if (exists) {
            res.status(400).json({ message: "Asset já existe" });
            return;
        }
        const asset = new assets_1.default(payload);
        await asset.save();
        res.status(201).json(asset);
    }
    catch (err) {
        console.error("Erro ao criar asset:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.createAsset = createAsset;
/**
 * @brief Update an asset by its ID or symbol.
 *
 * Tries to update the asset first by _id, then by symbol.
 *
 * @param req HTTP request with identifier (asset _id or symbol) as a URL parameter and update data in the body.
 * @param res HTTP response.
 * @returns The updated asset or 404 if not found.
 */
const updateAsset = async (req, res) => {
    try {
        const { identifier } = req.params;
        const updates = req.body;
        // Try to update by _id
        let asset = await assets_1.default.findByIdAndUpdate(identifier, updates, { new: true });
        // If not found, try by symbol
        if (!asset) {
            asset = await assets_1.default.findOneAndUpdate({ symbol: identifier }, updates, { new: true });
        }
        if (!asset) {
            res.status(404).json({ message: "Asset não encontrado" });
            return;
        }
        res.json(asset);
    }
    catch (err) {
        console.error("Erro ao atualizar asset:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.updateAsset = updateAsset;
/**
 * @brief Delete an asset by its ID or symbol.
 *
 * Tries to delete the asset first by _id, then by symbol.
 *
 * @param req HTTP request with identifier (asset _id or symbol) as a URL parameter.
 * @param res HTTP response.
 * @returns Success message if deleted or 404 if not found.
 */
const deleteAsset = async (req, res) => {
    try {
        const { identifier } = req.params;
        // Try to delete by _id
        let result = await assets_1.default.deleteOne({ _id: identifier });
        // If not deleted, try by symbol
        if (result.deletedCount === 0) {
            result = await assets_1.default.deleteOne({ symbol: identifier });
        }
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "Asset não encontrado" });
            return;
        }
        res.json({ message: "Asset removido com sucesso" });
    }
    catch (err) {
        console.error("Erro ao deletar asset:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.deleteAsset = deleteAsset;
