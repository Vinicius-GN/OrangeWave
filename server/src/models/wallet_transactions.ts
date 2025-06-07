import { Schema, model } from "mongoose";
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
export default model("WalletTransaction", WalletTxSchema);
