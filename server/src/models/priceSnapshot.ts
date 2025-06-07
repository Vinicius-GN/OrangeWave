import { Schema, model } from "mongoose";

const PriceSnapshot = new Schema(
  {
    assetId: { type: String, ref: "Asset" },
    timeframe: { type: String, enum: ["hour", "day", "week", "month", "year"] },
    timestamp: Date,
    price: Number
  },
  { timestamps: false }
);

export default model("PriceSnapshot", PriceSnapshot);
