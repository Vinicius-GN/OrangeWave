"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/orderRoutes.ts
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/", orderController_1.listOrders);
router.get("/:id", orderController_1.getOrderById);
router.post("/", auth_1.verifyToken, orderController_1.createOrder);
router.delete("/:id", auth_1.verifyToken, orderController_1.deleteOrder);
exports.default = router;
