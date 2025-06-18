import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Returns authenticated user data (without the password)
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

// Updates user data (including address)
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

// Deletes the user's own account (hard delete)
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

export const resetPasswordByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ message: "E-mail e nova senha são obrigatórios" });
      return;
    }

    // 1) Encontra usuário por e-mail
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    // 2) Hash da nova senha
    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashed;

    // 3) Salva
    await user.save();

    res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    console.error("Erro ao resetar senha por e-mail:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};