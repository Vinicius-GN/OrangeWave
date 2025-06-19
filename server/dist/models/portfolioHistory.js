"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PortfolioHistorySchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true }, // User ID
    date: { type: Date, required: true, index: true }, // Snapshot date
    totalValue: { type: Number, required: true }, // Portfolio value
}, { timestamps: true } // Adds createdAt and updatedAt fields
);
// Ensure only one record per user per day
PortfolioHistorySchema.index({ userId: 1, date: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("PortfolioHistory", PortfolioHistorySchema);
