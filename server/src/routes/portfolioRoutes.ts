// src/routes/portfolioRoutes.ts
import { Router } from "express";
import {
  listPortfolio,
  upsertPortfolio,
  deletePortfolioItem,
} from "../controllers/portfolioController";
import { verifyToken } from "../middlewares/auth";

// Express router for portfolio management endpoints
// Handles listing, updating, and deleting portfolio items for a user
const router = Router();
// GET /:userId - List all assets in the user's portfolio
router.get("/:userId", verifyToken, listPortfolio);
// POST /:userId - Add or update an asset in the user's portfolio
router.post("/:userId", verifyToken, upsertPortfolio);
// DELETE /:userId/:symbol - Remove an asset from the user's portfolio
router.delete("/:userId/:symbol", verifyToken, deletePortfolioItem);

export default router;
