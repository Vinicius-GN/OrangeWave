import { Schema, model } from "mongoose";

const NewsSchema = new Schema(
  {
    _id: String,
    title: String,
    summary: String,
    content: String,
    category: { type: String, enum: ["crypto", "stocks", "market", "economy"] },
    source: String,
    imageUrl: String,
    publishedAt: Date,
    relatedAssets: [String]     // asset IDs
  },
  { timestamps: false }
);
export default model("News", NewsSchema);
