/**
 * @file assetController.ts
 * @brief Controller for asset management: list, get, create, update, and delete assets.
 *
 * This file defines controller functions for handling asset operations,
 * including listing all assets, getting an asset by ID or symbol,
 * creating new assets, updating existing assets, and deleting assets.
 */

import { Request, Response } from "express";
import Asset from "../models/assets";
import mongoose from "mongoose";

/**
 * @brief List all assets.
 *
 * @param _req HTTP request (unused).
 * @param res HTTP response.
 * @returns Array of all assets.
 */
export const listAssets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    console.error("Erro ao listar assets:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * @brief Get a single asset by its ID or symbol.
 *
 * Tries to find the asset first by _id, then by symbol.
 *
 * @param req HTTP request with identifier (asset _id or symbol) as a URL parameter.
 * @param res HTTP response.
 * @returns The requested asset or 404 if not found.
 */
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

/**
 * @brief Create a new asset.
 *
 * Checks for duplicate asset symbol before creation.
 *
 * @param req HTTP request containing asset details in the body.
 * @param res HTTP response.
 * @returns The newly created asset or an error if already exists.
 */
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

/**
 * @brief Update an asset by its ID or symbol.
 *
 * Tries to update the asset first by _id, then by symbol.
 *
 * @param req HTTP request with identifier (asset _id or symbol) as a URL parameter and update data in the body.
 * @param res HTTP response.
 * @returns The updated asset or 404 if not found.
 */
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

/**
 * @brief Delete an asset by its ID or symbol.
 *
 * Tries to delete the asset first by _id, then by symbol.
 *
 * @param req HTTP request with identifier (asset _id or symbol) as a URL parameter.
 * @param res HTTP response.
 * @returns Success message if deleted or 404 if not found.
 */
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
