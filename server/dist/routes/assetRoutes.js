"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/assetRoutes.ts
const express_1 = require("express");
const assetController_1 = require("../controllers/assetController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/", assetController_1.listAssets);
router.post("/", auth_1.verifyToken, assetController_1.createAsset);
router.get("/:identifier", assetController_1.getAsset);
router.put("/:identifier", auth_1.verifyToken, assetController_1.updateAsset);
router.delete("/:identifier", auth_1.verifyToken, assetController_1.deleteAsset);
exports.default = router;
