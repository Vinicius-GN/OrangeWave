import { Schema, model } from "mongoose";

const AssetSchema = new Schema(
  {
    _id: String,              // "asset-aapl"
    symbol: { type: String, unique: true },
    name: String,
    description: String,
    type: { type: String, enum: ["stock", "crypto"], required: true },
    price: Number,
    marketCap: Number,
    availableStock: Number,
    volume: Number,
    logoUrl: String,
    quantityBougth: Number
  },
  { timestamps: true }
);

export default model("Asset", AssetSchema);
