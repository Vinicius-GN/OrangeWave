import { Request, Response } from "express";
import PriceSnapshot from "../models/priceSnapshot";

// List all price snapshots for an asset, optionally filtering by timeframe via query
export const listPriceSnapshots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId } = req.params;
    const { timeframe } = req.query; // e.g., ?timeframe=hour
    // Build filter for asset and optional timeframe
    const filter: { assetId: string; timeframe?: string } = { assetId };
    if (typeof timeframe === "string") {
      filter.timeframe = timeframe;
    }
    // Find and return all matching price snapshots, most recent first
    const snapshots = await PriceSnapshot.find(filter).sort({ timestamp: -1 });
    res.json(snapshots);
  } catch (err) {
    console.error("Erro ao listar price snapshots:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Return the latest price snapshot for each timeframe for an asset
export const lastPriceSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId } = req.params;
    // Aggregate to get the most recent snapshot for each timeframe
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
