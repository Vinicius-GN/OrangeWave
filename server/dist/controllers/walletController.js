"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWalletTransactions = exports.withdraw = exports.deposit = exports.updateCardNumber = exports.getWalletInfo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const wallet_1 = __importDefault(require("../models/wallet"));
const wallet_transactions_1 = __importDefault(require("../models/wallet_transactions"));
/**
 * 1) Retorna tanto o balance quanto o cardNumber do usuário
 */
const getWalletInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        const wallet = await wallet_1.default.findOne({ userId });
        if (!wallet) {
            res.status(404).json({ message: "Wallet não encontrada" });
            return;
        }
        // Retornamos { balance, cardNumber }
        res.json({
            balance: wallet.balance,
            cardNumber: wallet.cardNumber || ""
        });
    }
    catch (err) {
        console.error("Erro ao obter wallet:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.getWalletInfo = getWalletInfo;
/**
 * 2) Cria ou atualiza o número do cartão do usuário.
 *    Se não existir wallet, cria uma com balance = 0 e set do cardNumber.
 */
const updateCardNumber = async (req, res) => {
    try {
        const { userId } = req.params;
        const { cardNumber } = req.body;
        if (!cardNumber || typeof cardNumber !== "string") {
            res.status(400).json({ message: "cardNumber é obrigatório" });
            return;
        }
        // Validação simples de formato (apenas dígitos, tamanho entre 10 e 19)
        if (!/^\d{10,19}$/.test(cardNumber)) {
            res.status(400).json({ message: "Formato inválido de cardNumber" });
            return;
        }
        // Busca a wallet existente
        let wallet = await wallet_1.default.findOne({ userId });
        if (!wallet) {
            // Se não existir, cria nova com balance = 0
            wallet = new wallet_1.default({
                userId,
                balance: 0,
                cardNumber
            });
        }
        else {
            // Se existir, apenas atualiza o campo cardNumber
            wallet.cardNumber = cardNumber;
        }
        await wallet.save();
        // Retorna o cardNumber atualizado (e opcionalmente balance)
        res.json({
            balance: wallet.balance,
            cardNumber: wallet.cardNumber
        });
    }
    catch (err) {
        console.error("Erro ao atualizar cardNumber:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.updateCardNumber = updateCardNumber;
/**
 * 3) Depósito (sem alterações)
 */
const deposit = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { userId } = req.params;
        const { amount, paymentMethod } = req.body;
        let wallet = await wallet_1.default.findOne({ userId }).session(session);
        if (!wallet) {
            wallet = new wallet_1.default({ userId, balance: 0, cardNumber: "" });
        }
        wallet.balance += amount;
        await wallet.save({ session });
        const tx = new wallet_transactions_1.default({
            _id: `tx-${Date.now()}`,
            userId,
            type: "deposit",
            amount,
            paymentMethod,
            status: "completed",
            timestamp: new Date()
        });
        await tx.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.json({ balance: wallet.balance });
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Erro no depósito:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.deposit = deposit;
/**
 * 4) Saque (sem alterações)
 */
const withdraw = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { userId } = req.params;
        const { amount, paymentMethod } = req.body;
        const wallet = await wallet_1.default.findOne({ userId }).session(session);
        if (!wallet || wallet.balance < amount) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({ message: "Saldo insuficiente" });
            return;
        }
        wallet.balance -= amount;
        await wallet.save({ session });
        const tx = new wallet_transactions_1.default({
            _id: `tx-${Date.now()}`,
            userId,
            type: "withdrawal",
            amount,
            paymentMethod,
            status: "completed",
            timestamp: new Date()
        });
        await tx.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.json({ balance: wallet.balance });
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Erro no saque:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.withdraw = withdraw;
/**
 * 5) Histórico de transações (sem alterações)
 */
const listWalletTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const txs = await wallet_transactions_1.default.find({ userId }).sort({ timestamp: -1 });
        res.json(txs);
    }
    catch (err) {
        console.error("Erro ao listar wallet transactions:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listWalletTransactions = listWalletTransactions;
