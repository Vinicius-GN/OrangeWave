import { Request, Response } from "express";
import PriceSnapshot from "../models/priceSnapshot";

// Lista todos os snapshots de um ativo, opcionalmente filtrando por timeframe via query
export const listPriceSnapshots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId } = req.params;
    const { timeframe } = req.query; // ex: ?timeframe=hour

    const filter: { assetId: string; timeframe?: string } = { assetId };
    if (typeof timeframe === "string") {
      filter.timeframe = timeframe;
    }

    const snapshots = await PriceSnapshot.find(filter).sort({ timestamp: -1 });
    res.json(snapshots);
  } catch (err) {
    console.error("Erro ao listar price snapshots:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Retorna o último snapshot de cada timeframe para um ativo
export const lastPriceSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId } = req.params;
    const result = await PriceSnapshot.aggregate([
      { $match: { assetId } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$timeframe",
          timestamp: { $first: "$timestamp" },
          price: { $first: "$price" },
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    console.error("Erro ao buscar último price snapshot:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};
