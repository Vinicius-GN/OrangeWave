import { Schema, model } from "mongoose";


const MarketOrderSchema = new Schema(
  {
    _id: String,
    userId: { type: String, ref: "User" },
    side: { type: String, enum: ["buy", "sell"] },
    assetId: String,
    assetName: String,
    symbol: String,
    type: { type: String, enum: ["stock", "crypto"] },
    quantity: Number,
    price: Number,
    total: Number,
    fees: Number,
    status: String,
    timestamp: Date
  },
  { timestamps: false }
);
export default model("MarketOrder", MarketOrderSchema);
