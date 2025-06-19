/**
 * @file userController.ts
 * @brief Controller for user operations: profile, update, delete, and password management.
 *
 * This file defines controller functions for handling authenticated user operations,
 * as well as administrative user management actions.
 */

import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";

/**
 * @interface AuthRequest
 * @brief Extends Express Request to include authenticated user information.
 *
 * @property user Optional user object containing userId and role.
 */
interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

/**
 * @brief Returns authenticated user data (without the password).
 *
 * @param req HTTP request containing authentication info.
 * @param res HTTP response.
 * @returns User data, or error if not authenticated or not found.
 */
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Usuário não autenticado" });
      return;
    }
    // Selects all fields except the password
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * @brief Updates authenticated user data (including address).
 *
 * Only updates fields provided in the request body.
 *
 * @param req HTTP request containing user fields to update.
 * @param res HTTP response.
 * @returns Updated user data, or error if not authenticated or not found.
 */
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Usuário não autenticado" });
      return;
    }

    const {
      fullName,
      email,
      phone,
      address: {
        country,
        state,
        city,
        street,
        number
      } = {}
    } = req.body;

    // Dynamically builds the updates object
    const updates: any = {};
    if (fullName) updates.fullName = fullName;
    if (email)    updates.email = email;
    if (phone)    updates.phone = phone;

    if (country || state || city || street || number) {
      updates.address = {};
      if (country) updates.address.country = country;
      if (state)   updates.address.state = state;
      if (city)    updates.address.city = city;
      if (street)  updates.address.street = street;
      if (number)  updates.address.number = number;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, select: "-password" }
    );
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * @brief Deletes the authenticated user's own account (hard delete).
 *
 * @param req HTTP request containing authentication info.
 * @param res HTTP response.
 * @returns Confirmation message or error if not authenticated or not found.
 */
export const deleteMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Usuário não autenticado" });
      return;
    }
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }
    res.json({ message: "Conta removida com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar conta:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * @brief Changes the password of the authenticated user.
 *
 * Compares the provided old password, validates it, and sets a new password.
 *
 * @param req HTTP request containing oldPassword and newPassword in the body.
 * @param res HTTP response.
 * @returns Confirmation message or error if old password is incorrect.
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  // Endpoint to change password
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Usuário não autenticado" });
      return;
    }
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Senha antiga incorreta" });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    console.error("Erro ao trocar senha:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * @brief Lists all users (ADMIN ONLY).
 *
 * @param _req HTTP request (unused).
 * @param res HTTP response.
 * @returns Array of all users without passwords.
 */
export const listUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  // Lists all users (ADMIN ONLY)
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * @brief Updates a user by ID (ADMIN ONLY).
 *
 * Updates provided fields for the specified user, except for "superadmin-id".
 *
 * @param req HTTP request with user ID in params and fields to update in body.
 * @param res HTTP response.
 * @returns Updated user data or error if user not found or forbidden.
 */
export const updateUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  // Updates a user by ID (ADMIN ONLY)
  try {
    const { id } = req.params;
    if (id === "superadmin-id") {
      res.status(403).json({ message: "Este usuário não pode ser alterado." });
      return;
    }

    const { fullName, phone, address = {} } = req.body;
    const updates: any = {};
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;

    if (Object.keys(address).length > 0) {
      updates.address = {};
      if (address.country) updates.address.country = address.country;
      if (address.state) updates.address.state = address.state;
      if (address.city) updates.address.city = address.city;
      if (address.street) updates.address.street = address.street;
      if (address.number) updates.address.number = address.number;
    }

    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, select: "-password" });
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * @brief Deletes a user by ID (ADMIN ONLY).
 *
 * Cannot delete the "superadmin-id" user.
 *
 * @param req HTTP request with user ID in params.
 * @param res HTTP response.
 * @returns Confirmation message or error if user not found or forbidden.
 */
export const deleteUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  // Deletes a user by ID (ADMIN ONLY)
  try {
    const { id } = req.params;
    if (id === "superadmin-id") {
      res.status(403).json({ message: "Este usuário não pode ser removido." });
      return;
    }

    const result = await User.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    res.json({ message: "Usuário removido com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar usuário:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * @brief Resets a user's password by email (ADMIN or password recovery).
 *
 * @param req HTTP request with email and newPassword in the body.
 * @param res HTTP response.
 * @returns Confirmation message or error if user not found.
 */
export const resetPasswordByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ message: "E-mail e nova senha são obrigatórios" });
      return;
    }

    // 1) Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    // 2) Hash new password
    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashed;

    // 3) Save user
    await user.save();

    res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    console.error("Erro ao resetar senha por e-mail:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};
