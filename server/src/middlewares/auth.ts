/**
 * @file authMiddleware.ts
 * @brief Express middlewares for authentication and authorization using JWT.
 *
 * This file provides middlewares to:
 * - Verify and validate JWT tokens
 * - Optionally decode JWT tokens if present
 * - Restrict route access to admin users only
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

const secret = process.env.JWT_SECRET!;

/**
 * @interface AuthRequest
 * @brief Extension of Express Request to optionally include user info.
 *
 * @property user Optional user object containing id and role ("admin" | "client").
 */
export interface AuthRequest extends Request {
  user?: { id: string; role: "admin" | "client" };
}

const JWT_SECRET = process.env.JWT_SECRET!;

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
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Token ausente" });
    return;
  }
  const [, token] = authHeader.split(" ");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    // If you have typed `AuthRequest`, use: (req as AuthRequest).user = payload
    (req as any).user = payload;
    next();
  } catch {
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
export function optionalToken(req: AuthRequest, _res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (hdr?.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(hdr.split(" ")[1], secret) as any;
    } catch {
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
export function isAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user || user.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }
  next();
}
