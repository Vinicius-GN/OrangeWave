"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/wallet.ts
const mongoose_1 = require("mongoose");
const WalletSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
    cardNumber: { type: String, required: false, default: "" }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Wallet", WalletSchema);
