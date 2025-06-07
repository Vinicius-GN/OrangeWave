"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AssetSchema = new mongoose_1.Schema({
    _id: String, // "asset-aapl"
    symbol: { type: String, unique: true },
    name: String,
    description: String,
    type: { type: String, enum: ["stock", "crypto"], required: true },
    price: Number,
    marketCap: Number,
    availableStock: Number,
    volume: Number,
    logoUrl: String,
    quantityBougth: Number
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Asset", AssetSchema);
