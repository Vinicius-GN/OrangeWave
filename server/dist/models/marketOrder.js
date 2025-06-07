"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MarketOrderSchema = new mongoose_1.Schema({
    _id: String,
    userId: { type: String, ref: "User" },
    side: { type: String, enum: ["buy", "sell"] },
    assetId: String,
    assetName: String,
    symbol: String,
    type: { type: String, enum: ["stock", "crypto"] },
    quantity: Number,
    price: Number,
    total: Number,
    fees: Number,
    status: String,
    timestamp: Date
}, { timestamps: false });
exports.default = (0, mongoose_1.model)("MarketOrder", MarketOrderSchema);
