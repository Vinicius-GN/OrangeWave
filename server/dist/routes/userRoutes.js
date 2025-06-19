"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Express router for user-related endpoints
// Handles user profile, password management, and admin user management
const express_1 = require("express");
const c = __importStar(require("../controllers/userController"));
const auth_1 = require("../middlewares/auth");
const r = (0, express_1.Router)();
// POST /change-password - Reset password by email
r.post("/change-password", c.resetPasswordByEmail);
// GET /me - Get current user's profile
r.get("/me", auth_1.verifyToken, c.me);
// PUT /me - Update current user's profile
r.put("/me", auth_1.verifyToken, c.updateMe);
// DELETE /me - Delete current user's account
r.delete("/me", auth_1.verifyToken, c.deleteMe);
// POST /me/change-password - Change password for current user
r.post("/me/change-password", auth_1.verifyToken, c.changePassword);
// Admin-only routes for managing users
// GET / - List all users (admin only)
r.get("/", auth_1.verifyToken, auth_1.isAdmin, c.listUsers);
// PUT /:id - Update user by ID (admin only)
r.put("/:id", auth_1.verifyToken, auth_1.isAdmin, c.updateUserById);
// DELETE /:id - Delete user by ID (admin only)
r.delete("/:id", auth_1.verifyToken, auth_1.isAdmin, c.deleteUserById);
exports.default = r;
