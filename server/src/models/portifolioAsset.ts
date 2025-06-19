/**
 * @file portfolioAsset.ts
 * @brief Mongoose model for portfolio assets.
 *
 * Defines the structure for portfolio asset documents in MongoDB,
 * representing which assets belong to a user's portfolio, their type, quantity, and purchase price.
 */

import { Schema, model } from "mongoose";

/**
 * @brief Mongoose schema for the PortfolioAsset model.
 *
 * Fields:
 * - userId: Reference to the user who owns the asset (String, ref: "User").
 * - assetId: Reference to the asset (String, ref: "Asset").
 * - symbol: Symbol of the asset (String).
 * - type: Asset type, either "stock" or "crypto" (String, enum).
 * - quantity: Quantity of the asset owned (Number).
 * - buyPrice: Purchase price of the asset (Number).
 *
 * Includes automatic createdAt/updatedAt timestamps.
 */
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

/**
 * @brief Exports the PortfolioAsset model.
 */
export default model("PortfolioAsset", PortfolioAssetSchema);
