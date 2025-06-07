import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

const secret = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  user?: { id: string; role: "admin" | "client" };
}

const JWT_SECRET = process.env.JWT_SECRET!;

// Se você quiser tipar o req.user, pode criar uma interface:
// interface AuthRequest extends Request { user: { userId: string; role: string } }

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Token ausente" });
    return;
  }
  const [, token] = authHeader.split(" ");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    // Se você tiver tipado `AuthRequest`, faça: (req as AuthRequest).user = payload
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
    return;
  }
}


// opcional: deixa passar sem token, mas preenche req.user se houver
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

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user || user.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }
  next();
}
