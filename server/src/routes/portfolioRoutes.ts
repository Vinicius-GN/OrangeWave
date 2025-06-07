// src/routes/portfolioRoutes.ts
import { Router } from "express";
import {
  listPortfolio,
  upsertPortfolio,
  deletePortfolioItem,
} from "../controllers/portfolioController";
import { verifyToken } from "../middlewares/auth";

const router = Router();
router.get("/:userId", verifyToken, listPortfolio);
router.post("/:userId", verifyToken, upsertPortfolio);
router.delete("/:userId/:symbol", verifyToken, deletePortfolioItem);

export default router;
