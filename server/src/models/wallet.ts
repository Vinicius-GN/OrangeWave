/**
 * @file wallet.ts
 * @brief Mongoose model for user wallet.
 *
 * Defines the structure for the Wallet document in MongoDB, used to store a user's balance and associated card information.
 */

import { Schema, model, Document } from "mongoose";

/**
 * @interface IWallet
 * @brief Interface representing a wallet document.
 *
 * @property userId     Unique user ID to whom the wallet belongs.
 * @property balance    Current wallet balance.
 * @property cardNumber Credit/debit card number associated with the wallet.
 */
interface IWallet extends Document {
  userId: string;
  balance: number;
  cardNumber: string;
}

/**
 * @brief Mongoose schema for the Wallet model.
 *
 * Fields:
 * - userId: String, required, unique.
 * - balance: Number, required, default 0.
 * - cardNumber: String, optional, default empty string.
 * Includes automatic createdAt/updatedAt timestamps.
 */
const WalletSchema = new Schema<IWallet>(
  {
    userId:     { type: String, required: true, unique: true },
    balance:    { type: Number, required: true, default: 0 },
    cardNumber: { type: String, required: false, default: "" }
  },
  { timestamps: true }
);

/**
 * @brief Exports the Wallet model.
 */
export default model<IWallet>("Wallet", WalletSchema);
