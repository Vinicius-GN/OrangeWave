"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.createOrder = exports.getOrderById = exports.listOrders = void 0;
const marketOrder_1 = __importDefault(require("../models/marketOrder"));
const listOrders = async (_req, res) => {
    try {
        const orders = await marketOrder_1.default.find().sort({ timestamp: -1 });
        res.json(orders);
    }
    catch (err) {
        console.error("Erro ao listar orders:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listOrders = listOrders;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await marketOrder_1.default.findById(id);
        if (!order) {
            res.status(404).json({ message: "Ordem não encontrada" });
            return;
        }
        res.json(order);
    }
    catch (err) {
        console.error("Erro ao obter ordem:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.getOrderById = getOrderById;
const createOrder = async (req, res) => {
    try {
        // espera-se que o front envie: { userId, side, assetId, assetName, symbol, type, quantity, price, total, fees, status, timestamp }
        const payload = req.body;
        const order = new marketOrder_1.default({
            _id: `tx-${new Date().getTime()}`,
            ...payload,
        });
        await order.save();
        res.status(201).json(order);
    }
    catch (err) {
        console.error("Erro ao criar ordem:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.createOrder = createOrder;
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await marketOrder_1.default.findByIdAndDelete(id);
        if (!result) {
            res.status(404).json({ message: "Ordem não encontrada" });
            return;
        }
        res.json({ message: "Ordem removida com sucesso" });
    }
    catch (err) {
        console.error("Erro ao deletar ordem:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.deleteOrder = deleteOrder;
