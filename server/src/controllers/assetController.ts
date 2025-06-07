import { Request, Response } from "express";
import Asset from "../models/assets";
import mongoose from "mongoose";

export const listAssets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    console.error("Erro ao listar assets:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

export const getAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;

    // Primeiro tenta buscar por _id
    let asset = await Asset.findById(identifier);

    // Se não encontrar, tenta por symbol
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


export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
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

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;
    const updates = req.body;

    // Tenta primeiro por _id
    let asset = await Asset.findByIdAndUpdate(identifier, updates, { new: true });

    // Se não achar, tenta por symbol
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


export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;

    // Tenta deletar por _id
    let result = await Asset.deleteOne({ _id: identifier });

    // Se não deletou, tenta por symbol
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
