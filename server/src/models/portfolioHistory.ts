import { Schema, model, Document } from "mongoose";

// Each document represents the total value of a user's portfolio on a specific date.
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

export default model<IPortfolioHistory>(
  "PortfolioHistory",
  PortfolioHistorySchema
);
