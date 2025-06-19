"use strict";
/**
 * @file walletController.ts
 * @brief Controller for wallet operations: balance, card management, deposit, withdrawal, and transaction history.
 *
 * This file defines controller functions for handling wallet actions, including getting wallet info,
 * managing card numbers, depositing and withdrawing funds, and listing wallet transactions.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWalletTransactions = exports.withdraw = exports.deposit = exports.updateCardNumber = exports.getWalletInfo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const wallet_1 = __importDefault(require("../models/wallet"));
const wallet_transactions_1 = __importDefault(require("../models/wallet_transactions"));
/**
 * @brief Get wallet info (balance and card number) for a user.
 *
 * @param req HTTP request with userId in params.
 * @param res HTTP response.
 * @returns Wallet balance and card number, or error if wallet not found.
 */
const getWalletInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        const wallet = await wallet_1.default.findOne({ userId });
        if (!wallet) {
            res.status(404).json({ message: "Wallet não encontrada" });
            return;
        }
        // Return wallet balance and card number
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
 * @brief Create or update the user's credit card number.
 *
 * If wallet does not exist, create it with balance = 0 and set cardNumber.
 * If wallet exists, update the cardNumber.
 *
 * @param req HTTP request with userId in params and cardNumber in body.
 * @param res HTTP response.
 * @returns Updated wallet balance and card number.
 */
const updateCardNumber = async (req, res) => {
    try {
        const { userId } = req.params;
        const { cardNumber } = req.body;
        if (!cardNumber || typeof cardNumber !== "string") {
            res.status(400).json({ message: "cardNumber é obrigatório" });
            return;
        }
        // Simple format validation (digits only, length 10-19)
        if (!/^\d{10,19}$/.test(cardNumber)) {
            res.status(400).json({ message: "Formato inválido de cardNumber" });
            return;
        }
        // Find or create wallet
        let wallet = await wallet_1.default.findOne({ userId });
        if (!wallet) {
            // If wallet does not exist, create new with balance = 0
            wallet = new wallet_1.default({
                userId,
                balance: 0,
                cardNumber
            });
        }
        else {
            // If wallet exists, just update cardNumber
            wallet.cardNumber = cardNumber;
        }
        await wallet.save();
        // Return updated cardNumber and balance
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
 * @brief Deposit funds into the user's wallet.
 *
 * Uses MongoDB transactions to ensure atomicity.
 *
 * @param req HTTP request with userId in params and amount/paymentMethod in body.
 * @param res HTTP response.
 * @returns Updated wallet balance.
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
        // Record deposit transaction
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
 * @brief Withdraw funds from the user's wallet.
 *
 * Uses MongoDB transactions to ensure atomicity.
 *
 * @param req HTTP request with userId in params and amount/paymentMethod in body.
 * @param res HTTP response.
 * @returns Updated wallet balance or error if wallet not found.
 */
const withdraw = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { userId } = req.params;
        const { amount, paymentMethod } = req.body;
        const wallet = await wallet_1.default.findOne({ userId }).session(session);
        if (!wallet) {
            res.status(404).json({ message: "Wallet não encontrada" });
            return;
        }
        wallet.balance -= amount;
        await wallet.save({ session });
        // Record withdrawal transaction
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
 * @brief List all wallet transactions for a user.
 *
 * Returns all wallet transactions for the user, sorted by most recent first.
 *
 * @param req HTTP request with userId in params.
 * @param res HTTP response.
 * @returns Array of wallet transactions.
 */
const listWalletTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        // Find all wallet transactions for the user, sorted by most recent
        const txs = await wallet_transactions_1.default.find({ userId }).sort({ timestamp: -1 });
        res.json(txs);
    }
    catch (err) {
        console.error("Erro ao listar wallet transactions:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listWalletTransactions = listWalletTransactions;
