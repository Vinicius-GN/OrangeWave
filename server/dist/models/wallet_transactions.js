"use strict";
/**
 * @file wallet_transactions.ts
 * @brief Mongoose model for wallet transactions.
 *
 * Defines the structure for wallet transaction documents in MongoDB, including deposit and withdrawal operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * @brief Mongoose schema for the WalletTransaction model.
 *
 * Fields:
 * - _id: Unique transaction identifier (String).
 * - userId: Reference to the user (String, ref: "User").
 * - type: Transaction type, either "deposit" or "withdrawal".
 * - amount: Transaction amount (Number).
 * - paymentMethod: Payment method used (String).
 * - status: Status of the transaction (String).
 * - timestamp: Date and time of the transaction (Date).
 *
 * Timestamps are disabled for this model.
 */
const WalletTxSchema = new mongoose_1.Schema({
    _id: String,
    userId: { type: String, ref: "User" },
    type: { type: String, enum: ["deposit", "withdrawal"] },
    amount: Number,
    paymentMethod: String,
    status: String,
    timestamp: Date
}, { timestamps: false });
/**
 * @brief Exports the WalletTransaction model.
 */
exports.default = (0, mongoose_1.model)("WalletTransaction", WalletTxSchema);
