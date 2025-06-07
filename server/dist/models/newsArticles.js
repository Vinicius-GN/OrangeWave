"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NewsSchema = new mongoose_1.Schema({
    _id: String,
    title: String,
    summary: String,
    content: String,
    category: { type: String, enum: ["crypto", "stocks", "market", "economy"] },
    source: String,
    imageUrl: String,
    publishedAt: Date,
    relatedAssets: [String] // asset IDs
}, { timestamps: false });
exports.default = (0, mongoose_1.model)("News", NewsSchema);
