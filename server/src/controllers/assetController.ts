import { Request, Response } from "express";
import Asset from "../models/assets";
import mongoose from "mongoose";

// List all assets
export const listAssets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    console.error("Erro ao listar assets:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Get a single asset by its ID or symbol
export const getAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;

    // Try to find asset by _id
    let asset = await Asset.findById(identifier);

    // If not found, try by symbol
    if (!asset) {
      asset = await Asset.findOne({ symbol: identifier });
    }

    if (!asset) {
      res.status(404).json({ message: "Asset não encontrado" });
      return;
    }

    res.json(asset);
  } catch (err) {
    console.error("Erro ao obter asset:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Create a new asset
export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;

    // Check if asset with the same symbol already exists
    const exists = await Asset.findOne({ symbol: payload.symbol });
    if (exists) {
      res.status(400).json({ message: "Asset já existe" });
      return;
    }
    const asset = new Asset(payload);
    await asset.save();
    res.status(201).json(asset);
  } catch (err) {
    console.error("Erro ao criar asset:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Update an asset by its ID or symbol
export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;
    const updates = req.body;

    // Try to update by _id
    let asset = await Asset.findByIdAndUpdate(identifier, updates, { new: true });

    // If not found, try by symbol
    if (!asset) {
      asset = await Asset.findOneAndUpdate({ symbol: identifier }, updates, { new: true });
    }

    if (!asset) {
      res.status(404).json({ message: "Asset não encontrado" });
      return;
    }

    res.json(asset);
  } catch (err) {
    console.error("Erro ao atualizar asset:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Delete an asset by its ID or symbol
export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;

    // Try to delete by _id
    let result = await Asset.deleteOne({ _id: identifier });

    // If not deleted, try by symbol
    if (result.deletedCount === 0) {
      result = await Asset.deleteOne({ symbol: identifier });
    }

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Asset não encontrado" });
      return;
    }

    res.json({ message: "Asset removido com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar asset:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};
