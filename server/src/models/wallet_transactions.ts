/**
 * @file wallet_transactions.ts
 * @brief Mongoose model for wallet transactions.
 *
 * Defines the structure for wallet transaction documents in MongoDB, including deposit and withdrawal operations.
 */

import { Schema, model } from "mongoose";

/**
 * @brief Mongoose schema for the WalletTransaction model.
 *
 * Fields:
 * - _id: Unique transaction identifier (String).
 * - userId: Reference to the user (String, ref: "User").
 * - type: Transaction type, either "deposit" or "withdrawal".
 * - amount: Transaction amount (Number).
 * - paymentMethod: Payment method used (String).
 * - status: Status of the transaction (String).
 * - timestamp: Date and time of the transaction (Date).
 *
 * Timestamps are disabled for this model.
 */
const WalletTxSchema = new Schema(
  {
    _id: String,
    userId: { type: String, ref: "User" },
    type: { type: String, enum: ["deposit", "withdrawal"] },
    amount: Number,
    paymentMethod: String,
    status: String,
    timestamp: Date
  },
  { timestamps: false }
);

/**
 * @brief Exports the WalletTransaction model.
 */
export default model("WalletTransaction", WalletTxSchema);
