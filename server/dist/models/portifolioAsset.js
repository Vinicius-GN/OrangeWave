"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PortfolioAssetSchema = new mongoose_1.Schema({
    userId: { type: String, ref: "User" },
    assetId: { type: String, ref: "Asset" },
    symbol: String,
    type: { type: String, enum: ["stock", "crypto"] },
    quantity: Number,
    buyPrice: Number
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("PortfolioAsset", PortfolioAssetSchema);
