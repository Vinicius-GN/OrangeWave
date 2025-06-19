// src/routes/newsRoutes.ts
import { Router } from "express";
import {
  listNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from "../controllers/newsController";
import { verifyToken } from "../middlewares/auth";

// Express router for news article endpoints
// Handles listing, retrieving, creating, updating, and deleting news articles
const router = Router();
// GET / - List all news articles
router.get("/", listNews);
// GET /:id - Get a single news article by ID
router.get("/:id", getNewsById);
// POST / - Create a new news article (requires authentication)
router.post("/", verifyToken, createNews);
// PUT /:id - Update an existing news article (requires authentication)
router.put("/:id", verifyToken, updateNews);
// DELETE /:id - Delete a news article (requires authentication)
router.delete("/:id", verifyToken, deleteNews);

export default router;
