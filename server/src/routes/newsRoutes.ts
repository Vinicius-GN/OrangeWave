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

const router = Router();
router.get("/", listNews);
router.get("/:id", getNewsById);
router.post("/", verifyToken, createNews);
router.put("/:id", verifyToken, updateNews);
router.delete("/:id", verifyToken, deleteNews);

export default router;
