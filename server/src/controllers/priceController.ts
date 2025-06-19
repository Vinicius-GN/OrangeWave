/**
 * @file priceSnapshotController.ts
 * @brief Controller for asset price snapshot operations.
 *
 * This file provides functions to list price snapshots for an asset and to return the latest price snapshot for each timeframe.
 */

import { Request, Response } from "express";
import PriceSnapshot from "../models/priceSnapshot";

/**
 * @brief List all price snapshots for an asset, optionally filtered by timeframe.
 *
 * @param req HTTP request with assetId as a URL parameter and optional timeframe as a query parameter.
 * @param res HTTP response.
 * @returns Array of price snapshots sorted from most recent to oldest.
 */
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

/**
 * @brief Return the latest price snapshot for each timeframe for an asset.
 *
 * Uses aggregation to group by timeframe and retrieve the most recent snapshot for each timeframe.
 *
 * @param req HTTP request with assetId as a URL parameter.
 * @param res HTTP response.
 * @returns Array of objects, each containing timeframe, timestamp, and price of the latest snapshot.
 */
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
