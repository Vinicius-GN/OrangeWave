"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAsset = exports.updateAsset = exports.createAsset = exports.getAsset = exports.listAssets = void 0;
const assets_1 = __importDefault(require("../models/assets"));
// List all assets
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
// Get a single asset by its ID or symbol
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
// Create a new asset
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
// Update an asset by its ID or symbol
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
// Delete an asset by its ID or symbol
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
