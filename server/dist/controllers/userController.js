"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordByEmail = exports.deleteUserById = exports.updateUserById = exports.listUsers = exports.changePassword = exports.deleteMe = exports.updateMe = exports.me = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Retorna dados do usuário autenticado (sem a senha)
const me = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Usuário não autenticado" });
            return;
        }
        // Seleciona todos os campos menos a senha
        const user = await user_1.default.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error("Erro ao buscar perfil:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.me = me;
// Atualiza dados do usuário (incluindo address)
const updateMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Usuário não autenticado" });
            return;
        }
        const { fullName, email, phone, address: { country, state, city, street, number } = {} } = req.body;
        // Monta objeto de updates dinamicamente
        const updates = {};
        if (fullName)
            updates.fullName = fullName;
        if (email)
            updates.email = email;
        if (phone)
            updates.phone = phone;
        if (country || state || city || street || number) {
            updates.address = {};
            if (country)
                updates.address.country = country;
            if (state)
                updates.address.state = state;
            if (city)
                updates.address.city = city;
            if (street)
                updates.address.street = street;
            if (number)
                updates.address.number = number;
        }
        const user = await user_1.default.findByIdAndUpdate(userId, { $set: updates }, { new: true, select: "-password" });
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error("Erro ao atualizar perfil:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.updateMe = updateMe;
// Deleta a própria conta (hard delete)
const deleteMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Usuário não autenticado" });
            return;
        }
        const result = await user_1.default.findByIdAndDelete(userId);
        if (!result) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.json({ message: "Conta removida com sucesso" });
    }
    catch (err) {
        console.error("Erro ao deletar conta:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.deleteMe = deleteMe;
// Endpoint para trocar senha
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Usuário não autenticado" });
            return;
        }
        const { oldPassword, newPassword } = req.body;
        const user = await user_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Senha antiga incorreta" });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: "Senha alterada com sucesso" });
    }
    catch (err) {
        console.error("Erro ao trocar senha:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.changePassword = changePassword;
// 🔒 Lista todos os usuários (ADMIN ONLY)
const listUsers = async (_req, res) => {
    try {
        const users = await user_1.default.find().select("-password");
        res.json(users);
    }
    catch (err) {
        console.error("Erro ao listar usuários:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listUsers = listUsers;
// 🔒 Atualiza um usuário por ID (ADMIN ONLY)
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === "superadmin-id") {
            res.status(403).json({ message: "Este usuário não pode ser alterado." });
            return;
        }
        const { fullName, phone, address = {} } = req.body;
        const updates = {};
        if (fullName)
            updates.fullName = fullName;
        if (phone)
            updates.phone = phone;
        if (Object.keys(address).length > 0) {
            updates.address = {};
            if (address.country)
                updates.address.country = address.country;
            if (address.state)
                updates.address.state = address.state;
            if (address.city)
                updates.address.city = address.city;
            if (address.street)
                updates.address.street = address.street;
            if (address.number)
                updates.address.number = address.number;
        }
        const user = await user_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, select: "-password" });
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.updateUserById = updateUserById;
// 🔒 Deleta um usuário por ID (ADMIN ONLY)
const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === "superadmin-id") {
            res.status(403).json({ message: "Este usuário não pode ser removido." });
            return;
        }
        const result = await user_1.default.findByIdAndDelete(id);
        if (!result) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.json({ message: "Usuário removido com sucesso" });
    }
    catch (err) {
        console.error("Erro ao deletar usuário:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.deleteUserById = deleteUserById;
const resetPasswordByEmail = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            res.status(400).json({ message: "E-mail e nova senha são obrigatórios" });
            return;
        }
        // 1) Encontra usuário por e-mail
        const user = await user_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        // 2) Hash da nova senha
        const saltRounds = 10;
        const hashed = await bcrypt_1.default.hash(newPassword, saltRounds);
        user.password = hashed;
        // 3) Salva
        await user.save();
        res.json({ message: "Senha alterada com sucesso" });
    }
    catch (err) {
        console.error("Erro ao resetar senha por e-mail:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.resetPasswordByEmail = resetPasswordByEmail;
