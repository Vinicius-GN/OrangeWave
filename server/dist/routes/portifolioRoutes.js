"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const portfolioController_1 = require("../controllers/portfolioController");
const auth_1 = require("../middlewares/auth");
const r = (0, express_1.Router)();
r.get("/", auth_1.verifyToken, portfolioController_1.list);
exports.default = r;
