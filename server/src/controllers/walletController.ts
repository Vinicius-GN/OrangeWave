// src/controllers/walletController.ts
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
 * 1) Retorna tanto o balance quanto o cardNumber do usuário
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
    // Retornamos { balance, cardNumber }
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
 * 2) Cria ou atualiza o número do cartão do usuário.
 *    Se não existir wallet, cria uma com balance = 0 e set do cardNumber.
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

    // Validação simples de formato (apenas dígitos, tamanho entre 10 e 19)
    if (!/^\d{10,19}$/.test(cardNumber)) {
      res.status(400).json({ message: "Formato inválido de cardNumber" });
      return;
    }

    // Busca a wallet existente
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      // Se não existir, cria nova com balance = 0
      wallet = new Wallet({
        userId,
        balance: 0,
        cardNumber
      });
    } else {
      // Se existir, apenas atualiza o campo cardNumber
      wallet.cardNumber = cardNumber;
    }
    await wallet.save();

    // Retorna o cardNumber atualizado (e opcionalmente balance)
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
 * 3) Depósito (sem alterações)
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
 * 4) Saque (sem alterações)
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
 * 5) Histórico de transações (sem alterações)
 */
export const listWalletTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const txs = await WalletTx.find({ userId }).sort({ timestamp: -1 });
    res.json(txs);
  } catch (err) {
    console.error("Erro ao listar wallet transactions:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};
