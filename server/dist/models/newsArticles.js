"use strict";
/**
 * @file news.ts
 * @brief Mongoose model for news articles.
 *
 * Defines the structure for news article documents in MongoDB,
 * representing articles related to crypto, stocks, market, or economy.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * @brief Mongoose schema for the News model.
 *
 * Fields:
 * - _id: Unique identifier for the news article (String).
 * - title: Title of the article (String).
 * - summary: Short summary of the article (String).
 * - content: Full content of the article (String).
 * - category: Article category, one of "crypto", "stocks", "market", or "economy" (String, enum).
 * - source: News source (String).
 * - imageUrl: URL of the image related to the article (String).
 * - publishedAt: Date when the article was published (Date).
 * - relatedAssets: Array of related asset IDs (Array of Strings).
 *
 * Timestamps are disabled for this model.
 */
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
/**
 * @brief Exports the News model.
 */
exports.default = (0, mongoose_1.model)("News", NewsSchema);
