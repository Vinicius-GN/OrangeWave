"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Mongoose model for financial assets (stocks, crypto, etc.)
// Defines schema for asset properties and metadata
const AssetSchema = new mongoose_1.Schema({
    _id: String, // Unique asset ID (e.g., "asset-aapl")
    symbol: { type: String, unique: true }, // Asset symbol (e.g., AAPL, BTC)
    name: String, // Asset name
    description: String, // Description of the asset
    type: { type: String, enum: ["stock", "crypto"], required: true }, // Asset type
    price: Number, // Current price
    marketCap: Number, // Market capitalization
    availableStock: Number, // Number of units available for trading
    volume: Number, // Trading volume
    logoUrl: String, // URL to asset logo
    quantityBougth: Number // Total quantity bought (typo: should be quantityBought)
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Asset", AssetSchema);
