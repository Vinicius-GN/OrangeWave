"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const register = async (req, res) => {
    try {
        const { fullName, email, password, role, phone, address: { country, state, city, street, number } = {} } = req.body;
        // Validação mínima de address (todos os campos obrigatórios)
        if (!country ||
            !state ||
            !city ||
            !street ||
            !number) {
            res.status(400).json({ message: "Todos os campos de endereço são obrigatórios" });
            return;
        }
        const existing = await user_1.default.findOne({ email });
        if (existing) {
            res.status(400).json({ message: "E-mail já cadastrado" });
            return;
        }
        const user = new user_1.default({
            _id: `user-${Date.now()}`,
            fullName,
            email,
            password,
            role: role ?? "client",
            phone,
            address: {
                country,
                state,
                city,
                street,
                number
            }
        });
        await user.save();
        // Extrai “password” e retorna o restante
        const userObj = user.toObject();
        const { password: _, ...userData } = userObj;
        res.status(201).json(userData);
    }
    catch (err) {
        console.error("Erro ao registrar usuário:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Credenciais inválidas" });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Credenciais inválidas" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token });
    }
    catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.login = login;
