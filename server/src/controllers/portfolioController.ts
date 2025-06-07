import { Request, Response } from "express";
import PortfolioAsset from "../models/portifolioAsset";

export const listPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const items = await PortfolioAsset.find({ userId });
    res.json(items);
  } catch (err) {
    console.error("Erro ao listar portfólio:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

export const upsertPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { assetId, symbol, type, quantity, buyPrice } = req.body;

    const existing = await PortfolioAsset.findOne({ userId, assetId });
    if (existing) {
      existing.quantity = quantity;
      existing.buyPrice = buyPrice;
      await existing.save();
      res.json(existing);
      return;
    }

    const item = new PortfolioAsset({
      userId,
      assetId,
      symbol,
      type,
      quantity,
      buyPrice,
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error("Erro ao inserir/atualizar portfólio:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

export const deletePortfolioItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, symbol } = req.params;
    const result = await PortfolioAsset.deleteOne({ userId, symbol });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Item não encontrado" });
      return;
    }
    res.json({ message: "Item removido do portfólio" });
  } catch (err) {
    console.error("Erro ao deletar portfólio:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};
