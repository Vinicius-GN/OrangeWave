// Express router for user-related endpoints
// Handles user profile, password management, and admin user management
import { Router } from "express";
import * as c from "../controllers/userController";
import { isAdmin, verifyToken } from "../middlewares/auth";

const r = Router();

// POST /change-password - Reset password by email
r.post("/change-password", c.resetPasswordByEmail);
// GET /me - Get current user's profile
r.get("/me", verifyToken, c.me);
// PUT /me - Update current user's profile
r.put("/me", verifyToken, c.updateMe);
// DELETE /me - Delete current user's account
r.delete("/me", verifyToken, c.deleteMe);
// POST /me/change-password - Change password for current user
r.post("/me/change-password", verifyToken, c.changePassword);

// Admin-only routes for managing users
// GET / - List all users (admin only)
r.get("/", verifyToken, isAdmin, c.listUsers);
// PUT /:id - Update user by ID (admin only)
r.put("/:id", verifyToken, isAdmin, c.updateUserById);
// DELETE /:id - Delete user by ID (admin only)
r.delete("/:id", verifyToken, isAdmin, c.deleteUserById);

export default r;
