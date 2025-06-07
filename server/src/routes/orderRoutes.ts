// src/routes/orderRoutes.ts
import { Router } from "express";
import {
  listOrders,
  getOrderById,
  createOrder,
  deleteOrder,
} from "../controllers/orderController";
import { verifyToken } from "../middlewares/auth";

const router = Router();
router.get("/", listOrders);
router.get("/:id", getOrderById);
router.post("/", verifyToken, createOrder);
router.delete("/:id", verifyToken, deleteOrder);

export default router;
