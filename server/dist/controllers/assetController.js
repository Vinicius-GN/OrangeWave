"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAsset = exports.updateAsset = exports.createAsset = exports.getAsset = exports.listAssets = void 0;
const assets_1 = __importDefault(require("../models/assets"));
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
const getAsset = async (req, res) => {
    try {
        const { identifier } = req.params;
        // Primeiro tenta buscar por _id
        let asset = await assets_1.default.findById(identifier);
        // Se não encontrar, tenta por symbol
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
const createAsset = async (req, res) => {
    try {
        const payload = req.body;
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
const updateAsset = async (req, res) => {
    try {
        const { identifier } = req.params;
        const updates = req.body;
        // Tenta primeiro por _id
        let asset = await assets_1.default.findByIdAndUpdate(identifier, updates, { new: true });
        // Se não achar, tenta por symbol
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
const deleteAsset = async (req, res) => {
    try {
        const { identifier } = req.params;
        // Tenta deletar por _id
        let result = await assets_1.default.deleteOne({ _id: identifier });
        // Se não deletou, tenta por symbol
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
