// Controller for wallet operations: balance, card management, deposit, withdrawal, and transaction history
import { Request, Response } from "express";
import mongoose from "mongoose";
import Wallet from "../models/wallet";
import WalletTx from "../models/wallet_transactions";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

/**
 * Get wallet info (balance and card number) for a user
 */
export const getWalletInfo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      res.status(404).json({ message: "Wallet não encontrada" });
      return;
    }
    // Return wallet balance and card number
    res.json({
      balance: wallet.balance,
      cardNumber: wallet.cardNumber || ""
    });
  } catch (err) {
    console.error("Erro ao obter wallet:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * Create or update the user's credit card number.
 * If wallet does not exist, create it with balance = 0 and set cardNumber.
 */
export const updateCardNumber = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { cardNumber } = req.body;
    if (!cardNumber || typeof cardNumber !== "string") {
      res.status(400).json({ message: "cardNumber é obrigatório" });
      return;
    }

    // Simple format validation (digits only, length 10-19)
    if (!/^\d{10,19}$/.test(cardNumber)) {
      res.status(400).json({ message: "Formato inválido de cardNumber" });
      return;
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      // If wallet does not exist, create new with balance = 0
      wallet = new Wallet({
        userId,
        balance: 0,
        cardNumber
      });
    } else {
      // If wallet exists, just update cardNumber
      wallet.cardNumber = cardNumber;
    }
    await wallet.save();

    // Return updated cardNumber and balance
    res.json({
      balance: wallet.balance,
      cardNumber: wallet.cardNumber
    });
  } catch (err) {
    console.error("Erro ao atualizar cardNumber:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * Deposit funds into the user's wallet
 */
export const deposit = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.params;
    const { amount, paymentMethod } = req.body;

    let wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0, cardNumber: "" });
    }

    wallet.balance += amount;
    await wallet.save({ session });

    // Record deposit transaction
    const tx = new WalletTx({
      _id: `tx-${Date.now()}`,
      userId,
      type: "deposit",
      amount,
      paymentMethod,
      status: "completed",
      timestamp: new Date()
    });
    await tx.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ balance: wallet.balance });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Erro no depósito:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * Withdraw funds from the user's wallet
 */
export const withdraw = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.params;
    const { amount, paymentMethod } = req.body;

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      res.status(404).json({ message: "Wallet não encontrada" });
      return;
    }

    wallet.balance -= amount;
    await wallet.save({ session });

    // Record withdrawal transaction
    const tx = new WalletTx({
      _id: `tx-${Date.now()}`,
      userId,
      type: "withdrawal",
      amount,
      paymentMethod,
      status: "completed",
      timestamp: new Date()
    });
    await tx.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ balance: wallet.balance });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Erro no saque:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * List all wallet transactions for a user
 */
export const listWalletTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    // Find all wallet transactions for the user, sorted by most recent
    const txs = await WalletTx.find({ userId }).sort({ timestamp: -1 });
    res.json(txs);
  } catch (err) {
    console.error("Erro ao listar wallet transactions:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};
