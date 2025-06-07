"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/newsRoutes.ts
const express_1 = require("express");
const newsController_1 = require("../controllers/newsController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/", newsController_1.listNews);
router.get("/:id", newsController_1.getNewsById);
router.post("/", auth_1.verifyToken, newsController_1.createNews);
router.put("/:id", auth_1.verifyToken, newsController_1.updateNews);
router.delete("/:id", auth_1.verifyToken, newsController_1.deleteNews);
exports.default = router;
