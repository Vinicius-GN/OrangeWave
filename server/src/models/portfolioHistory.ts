/**
 * @file portfolioHistory.ts
 * @brief Mongoose model for portfolio history.
 *
 * Defines the structure for documents that represent the total value of a user's portfolio on a specific date.
 * Each record is unique per user per day.
 */

import { Schema, model, Document } from "mongoose";

/**
 * @interface IPortfolioHistory
 * @brief Interface for the portfolio history document.
 *
 * @property userId     Reference to the user (_id).
 * @property date       Date of the portfolio snapshot (time set to midnight).
 * @property totalValue Total value of the user's portfolio on that date.
 */
export interface IPortfolioHistory extends Document {
  userId: string;       // Reference to the user (_id)
  date: Date;           // Date (time set to midnight)
  totalValue: number;   // Total value of the portfolio on that day
}

const PortfolioHistorySchema = new Schema<IPortfolioHistory>(
  {
    userId: { type: String, required: true, index: true }, // User ID
    date:   { type: Date, required: true, index: true },   // Snapshot date
    totalValue: { type: Number, required: true },          // Portfolio value
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Ensure only one record per user per day
PortfolioHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

/**
 * @brief Exports the PortfolioHistory model.
 */
export default model<IPortfolioHistory>(
  "PortfolioHistory",
  PortfolioHistorySchema
);
