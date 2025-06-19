// src/routes/orderRoutes.ts
// Express router for order endpoints
// Handles listing, retrieving, creating, and deleting market orders
import { Router } from "express";
import {
  listOrders,
  getOrderById,
  createOrder,
  deleteOrder,
} from "../controllers/orderController";
import { verifyToken } from "../middlewares/auth";

const router = Router();
// GET / - List all market orders
router.get("/", listOrders);
// GET /:id - Get a single order by ID
router.get("/:id", getOrderById);
// POST / - Create a new order (requires authentication)
router.post("/", verifyToken, createOrder);
// DELETE /:id - Delete an order (requires authentication)
router.delete("/:id", verifyToken, deleteOrder);

export default router;
