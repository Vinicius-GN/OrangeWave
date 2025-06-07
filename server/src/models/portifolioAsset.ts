import { Schema, model } from "mongoose";
const PortfolioAssetSchema = new Schema(
  {
    userId: { type: String, ref: "User" },
    assetId: { type: String, ref: "Asset" },
    symbol: String,
    type: { type: String, enum: ["stock", "crypto"] },
    quantity: Number,
    buyPrice: Number
  },
  { timestamps: true }
);
export default model("PortfolioAsset", PortfolioAssetSchema);
