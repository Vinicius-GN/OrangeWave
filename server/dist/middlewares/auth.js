"use strict";
/**
 * @file authMiddleware.ts
 * @brief Express middlewares for authentication and authorization using JWT.
 *
 * This file provides middlewares to:
 * - Verify and validate JWT tokens
 * - Optionally decode JWT tokens if present
 * - Restrict route access to admin users only
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.optionalToken = optionalToken;
exports.isAdmin = isAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
/**
 * @brief Middleware to verify the JWT token and attach user info to the request.
 *
 * If the token is valid, attaches the payload to req.user.
 * If not, returns 401 (Unauthorized).
 *
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next middleware function.
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Token ausente" });
        return;
    }
    const [, token] = authHeader.split(" ");
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // If you have typed `AuthRequest`, use: (req as AuthRequest).user = payload
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ message: "Token inválido" });
        return;
    }
}
/**
 * @brief Middleware to optionally decode the JWT token if present.
 *
 * If a valid token is present, attaches user info to req.user.
 * If no token is present, proceeds without authentication.
 *
 * @param req Express request object extended with AuthRequest.
 * @param _res Express response object (unused).
 * @param next Express next middleware function.
 */
function optionalToken(req, _res, next) {
    const hdr = req.headers.authorization;
    if (hdr?.startsWith("Bearer ")) {
        try {
            req.user = jsonwebtoken_1.default.verify(hdr.split(" ")[1], secret);
        }
        catch {
            /* ignore */
        }
    }
    next();
}
/**
 * @brief Middleware to restrict access to admin users only.
 *
 * Allows route access only if req.user exists and the role is "admin".
 * Otherwise, returns 403 (Forbidden).
 *
 * @param req Express request object extended with AuthRequest.
 * @param res Express response object.
 * @param next Express next middleware function.
 */
function isAdmin(req, res, next) {
    const user = req.user;
    if (!user || user.role !== "admin") {
        res.status(403).json({ message: "Access denied. Admins only." });
        return;
    }
    next();
}
