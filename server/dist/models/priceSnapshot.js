"use strict";
/**
 * @file priceSnapshot.ts
 * @brief Mongoose model for asset price snapshots.
 *
 * Defines the structure for price snapshot documents in MongoDB,
 * used to store historical prices of assets at different timeframes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * @brief Mongoose schema for the PriceSnapshot model.
 *
 * Fields:
 * - assetId: Reference to the asset (String, ref: "Asset").
 * - timeframe: The timeframe of the snapshot ("hour", "day", "week", "month", "year").
 * - timestamp: The date and time when the snapshot was taken (Date).
 * - price: The asset price at the given timestamp (Number).
 *
 * Timestamps are disabled for this model.
 */
const PriceSnapshot = new mongoose_1.Schema({
    assetId: { type: String, ref: "Asset" },
    timeframe: { type: String, enum: ["hour", "day", "week", "month", "year"] },
    timestamp: Date,
    price: Number
}, { timestamps: false });
/**
 * @brief Exports the PriceSnapshot model.
 */
exports.default = (0, mongoose_1.model)("PriceSnapshot", PriceSnapshot);
