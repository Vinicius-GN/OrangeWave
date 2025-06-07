import { Router } from "express";
import * as c from "../controllers/userController";
import { isAdmin, verifyToken } from "../middlewares/auth";

const r = Router();

r.post("/change-password", c.resetPasswordByEmail);
r.get("/me", verifyToken, c.me);
r.put("/me", verifyToken, c.updateMe);
r.delete("/me", verifyToken, c.deleteMe);
r.post("/me/change-password", verifyToken, c.changePassword);

// 🔒 Admin-only RUD operations
r.get("/", verifyToken, isAdmin, c.listUsers);
r.put("/:id", verifyToken, isAdmin, c.updateUserById);
r.delete("/:id", verifyToken, isAdmin, c.deleteUserById);

export default r;
