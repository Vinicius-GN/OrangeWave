"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WalletTxSchema = new mongoose_1.Schema({
    _id: String,
    userId: { type: String, ref: "User" },
    type: { type: String, enum: ["deposit", "withdrawal"] },
    amount: Number,
    paymentMethod: String,
    status: String,
    timestamp: Date
}, { timestamps: false });
exports.default = (0, mongoose_1.model)("WalletTransaction", WalletTxSchema);
