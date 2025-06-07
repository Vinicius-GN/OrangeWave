"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PriceSnapshot = new mongoose_1.Schema({
    assetId: { type: String, ref: "Asset" },
    timeframe: { type: String, enum: ["hour", "day", "week", "month", "year"] },
    timestamp: Date,
    price: Number
}, { timestamps: false });
exports.default = (0, mongoose_1.model)("PriceSnapshot", PriceSnapshot);
