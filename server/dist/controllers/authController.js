"use strict";
/**
 * @file authController.ts
 * @brief Controller for user authentication: registration and login.
 *
 * This file defines controller functions for registering new users and authenticating users,
 * including JWT token generation for login.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
/**
 * @brief Register a new user.
 *
 * Validates required fields, checks for duplicate email, and creates a new user record.
 *
 * @param req HTTP request containing new user data in the body.
 * @param res HTTP response.
 * @returns The created user data without the password, or an error.
 */
const register = async (req, res) => {
    try {
        const { fullName, email, password, role, phone, address: { country, state, city, street, number } = {} } = req.body;
        // Minimal address validation (all fields required)
        if (!country ||
            !state ||
            !city ||
            !street ||
            !number) {
            res.status(400).json({ message: "Todos os campos de endereço são obrigatórios" });
            return;
        }
        // Check if email is already registered
        const existing = await user_1.default.findOne({ email });
        if (existing) {
            res.status(400).json({ message: "E-mail já cadastrado" });
            return;
        }
        // Create and save new user
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
        // Remove password from response
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
/**
 * @brief Authenticate user and return JWT token.
 *
 * Checks user credentials and returns a signed JWT token on success.
 *
 * @param req HTTP request containing email and password in the body.
 * @param res HTTP response.
 * @returns JWT token or an error message on failure.
 */
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
        // Generate JWT token for authenticated user
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token });
    }
    catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.login = login;
