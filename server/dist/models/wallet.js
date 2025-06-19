"use strict";
/**
 * @file wallet.ts
 * @brief Mongoose model for user wallet.
 *
 * Defines the structure for the Wallet document in MongoDB, used to store a user's balance and associated card information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * @brief Mongoose schema for the Wallet model.
 *
 * Fields:
 * - userId: String, required, unique.
 * - balance: Number, required, default 0.
 * - cardNumber: String, optional, default empty string.
 * Includes automatic createdAt/updatedAt timestamps.
 */
const WalletSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
    cardNumber: { type: String, required: false, default: "" }
}, { timestamps: true });
/**
 * @brief Exports the Wallet model.
 */
exports.default = (0, mongoose_1.model)("Wallet", WalletSchema);
