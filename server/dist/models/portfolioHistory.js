"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PortfolioHistorySchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    totalValue: { type: Number, required: true },
}, { timestamps: true });
// Garante que só exista um registro por usuário por dia
PortfolioHistorySchema.index({ userId: 1, date: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("PortfolioHistory", PortfolioHistorySchema);
