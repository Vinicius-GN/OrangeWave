import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      phone,
      address: {
        country,
        state,
        city,
        street,
        number
      } = {}
    } = req.body;
    // Minimal address validation (all fields required)
    if (
      !country ||
      !state ||
      !city ||
      !street ||
      !number
    ) {
      res.status(400).json({ message: "Todos os campos de endereço são obrigatórios" });
      return;
    }
    // Check if email is already registered
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "E-mail já cadastrado" });
      return;
    }
    // Create and save new user
    const user = new User({
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
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Authenticate user and return JWT token
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Credenciais inválidas" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Credenciais inválidas" });
      return;
    }
    // Generate JWT token for authenticated user
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};
