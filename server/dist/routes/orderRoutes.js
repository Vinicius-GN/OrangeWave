"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/orderRoutes.ts
// Express router for order endpoints
// Handles listing, retrieving, creating, and deleting market orders
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// GET / - List all market orders
router.get("/", orderController_1.listOrders);
// GET /:id - Get a single order by ID
router.get("/:id", orderController_1.getOrderById);
// POST / - Create a new order (requires authentication)
router.post("/", auth_1.verifyToken, orderController_1.createOrder);
// DELETE /:id - Delete an order (requires authentication)
router.delete("/:id", auth_1.verifyToken, orderController_1.deleteOrder);
exports.default = router;
