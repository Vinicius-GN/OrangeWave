"use strict";
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
// Se você quiser tipar o req.user, pode criar uma interface:
// interface AuthRequest extends Request { user: { userId: string; role: string } }
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Token ausente" });
        return;
    }
    const [, token] = authHeader.split(" ");
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Se você tiver tipado `AuthRequest`, faça: (req as AuthRequest).user = payload
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ message: "Token inválido" });
        return;
    }
}
// opcional: deixa passar sem token, mas preenche req.user se houver
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
function isAdmin(req, res, next) {
    const user = req.user;
    if (!user || user.role !== "admin") {
        res.status(403).json({ message: "Access denied. Admins only." });
        return;
    }
    next();
}
