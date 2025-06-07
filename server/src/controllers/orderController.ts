import { Request, Response } from "express";
import MarketOrder from "../models/marketOrder";

export const listOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await MarketOrder.find().sort({ timestamp: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Erro ao listar orders:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await MarketOrder.findById(id);
    if (!order) {
      res.status(404).json({ message: "Ordem não encontrada" });
      return;
    }
    res.json(order);
  } catch (err) {
    console.error("Erro ao obter ordem:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // espera-se que o front envie: { userId, side, assetId, assetName, symbol, type, quantity, price, total, fees, status, timestamp }
    const payload = req.body;
    const order = new MarketOrder({
      _id: `tx-${new Date().getTime()}`,
      ...payload,
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Erro ao criar ordem:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await MarketOrder.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ message: "Ordem não encontrada" });
      return;
    }
    res.json({ message: "Ordem removida com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar ordem:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};
