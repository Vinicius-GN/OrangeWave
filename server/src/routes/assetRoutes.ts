// src/routes/assetRoutes.ts
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
router.get("/", listAssets);
router.post("/", verifyToken, createAsset);
router.get("/:identifier", getAsset);
router.put("/:identifier", verifyToken, updateAsset);
router.delete("/:identifier", verifyToken, deleteAsset);


export default router;
