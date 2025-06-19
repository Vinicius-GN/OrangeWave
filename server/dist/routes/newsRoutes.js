"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/newsRoutes.ts
const express_1 = require("express");
const newsController_1 = require("../controllers/newsController");
const auth_1 = require("../middlewares/auth");
// Express router for news article endpoints
// Handles listing, retrieving, creating, updating, and deleting news articles
const router = (0, express_1.Router)();
// GET / - List all news articles
router.get("/", newsController_1.listNews);
// GET /:id - Get a single news article by ID
router.get("/:id", newsController_1.getNewsById);
// POST / - Create a new news article (requires authentication)
router.post("/", auth_1.verifyToken, newsController_1.createNews);
// PUT /:id - Update an existing news article (requires authentication)
router.put("/:id", auth_1.verifyToken, newsController_1.updateNews);
// DELETE /:id - Delete a news article (requires authentication)
router.delete("/:id", auth_1.verifyToken, newsController_1.deleteNews);
exports.default = router;
