import { Schema, model } from "mongoose";

// Mongoose model for financial assets (stocks, crypto, etc.)
// Defines schema for asset properties and metadata
const AssetSchema = new Schema(
  {
    _id: String,              // Unique asset ID (e.g., "asset-aapl")
    symbol: { type: String, unique: true }, // Asset symbol (e.g., AAPL, BTC)
    name: String,             // Asset name
    description: String,      // Description of the asset
    type: { type: String, enum: ["stock", "crypto"], required: true }, // Asset type
    price: Number,            // Current price
    marketCap: Number,        // Market capitalization
    availableStock: Number,   // Number of units available for trading
    volume: Number,           // Trading volume
    logoUrl: String,          // URL to asset logo
    quantityBougth: Number    // Total quantity bought (typo: should be quantityBought)
  },
  { timestamps: true }
);

export default model("Asset", AssetSchema);
