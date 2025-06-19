// src/routes/assetRoutes.ts
// Express router for asset endpoints
// Handles listing, retrieving, creating, updating, and deleting assets
import { Router } from "express";
import {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../controllers/assetController";
import { verifyToken } from "../middlewares/auth";

const router = Router();
// GET / - List all assets
router.get("/", listAssets);
// POST / - Create a new asset (requires authentication)
router.post("/", verifyToken, createAsset);
// GET /:identifier - Get a single asset by identifier
router.get("/:identifier", getAsset);
// PUT /:identifier - Update an asset by identifier (requires authentication)
router.put("/:identifier", verifyToken, updateAsset);
// DELETE /:identifier - Delete an asset by identifier (requires authentication)
router.delete("/:identifier", verifyToken, deleteAsset);

export default router;
