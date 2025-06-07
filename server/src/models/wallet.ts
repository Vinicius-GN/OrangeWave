// src/models/wallet.ts
import { Schema, model, Document } from "mongoose";

interface IWallet extends Document {
  userId: string;
  balance: number;
  cardNumber: string;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId:     { type: String, required: true, unique: true },
    balance:    { type: Number, required: true, default: 0 },
    cardNumber: { type: String, required: false, default: "" }
  },
  { timestamps: true }
);

export default model<IWallet>("Wallet", WalletSchema);
