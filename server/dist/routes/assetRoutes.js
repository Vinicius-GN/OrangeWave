"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/assetRoutes.ts
// Express router for asset endpoints
// Handles listing, retrieving, creating, updating, and deleting assets
const express_1 = require("express");
const assetController_1 = require("../controllers/assetController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// GET / - List all assets
router.get("/", assetController_1.listAssets);
// POST / - Create a new asset (requires authentication)
router.post("/", auth_1.verifyToken, assetController_1.createAsset);
// GET /:identifier - Get a single asset by identifier
router.get("/:identifier", assetController_1.getAsset);
// PUT /:identifier - Update an asset by identifier (requires authentication)
router.put("/:identifier", auth_1.verifyToken, assetController_1.updateAsset);
// DELETE /:identifier - Delete an asset by identifier (requires authentication)
router.delete("/:identifier", auth_1.verifyToken, assetController_1.deleteAsset);
exports.default = router;
