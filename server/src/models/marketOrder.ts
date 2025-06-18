import { Schema, model } from "mongoose";

// Mongoose model for market orders (buy/sell transactions)
// Represents a user's order to buy or sell an asset
const MarketOrderSchema = new Schema(
  {
    _id: String,                        // Unique order ID
    userId: { type: String, ref: "User" }, // Reference to user placing the order
    side: { type: String, enum: ["buy", "sell"] }, // Order side: buy or sell
    assetId: String,                    // ID of the asset being traded
    assetName: String,                  // Name of the asset
    symbol: String,                     // Asset symbol (e.g., AAPL, BTC)
    type: { type: String, enum: ["stock", "crypto"] }, // Asset type
    quantity: Number,                   // Quantity of asset to trade
    price: Number,                      // Price per unit
    total: Number,                      // Total value of the order
    fees: Number,                       // Transaction fees
    status: String,                     // Order status (e.g., completed, pending)
    timestamp: Date                     // Time the order was placed
  },
  { timestamps: false }
);
export default model("MarketOrder", MarketOrderSchema);
