"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNews = exports.updateNews = exports.createNews = exports.getNewsById = exports.listNews = void 0;
const newsArticles_1 = __importDefault(require("../models/newsArticles"));
// List all news articles, sorted by most recent
const listNews = async (_req, res) => {
    try {
        const articles = await newsArticles_1.default.find().sort({ publishedAt: -1 });
        res.json(articles);
    }
    catch (err) {
        console.error("Erro ao listar news:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listNews = listNews;
// Get a single news article by its ID
const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await newsArticles_1.default.findById(id);
        if (!article) {
            res.status(404).json({ message: "Notícia não encontrada" });
            return;
        }
        res.json(article);
    }
    catch (err) {
        console.error("Erro ao obter news:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.getNewsById = getNewsById;
// Create a new news article
const createNews = async (req, res) => {
    try {
        const payload = req.body;
        const article = new newsArticles_1.default({ _id: `news-${new Date().getTime()}`, ...payload });
        await article.save();
        res.status(201).json(article);
    }
    catch (err) {
        console.error("Erro ao criar notícia:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.createNews = createNews;
// Update an existing news article by its ID
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const article = await newsArticles_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!article) {
            res.status(404).json({ message: "Notícia não encontrada" });
            return;
        }
        res.json(article);
    }
    catch (err) {
        console.error("Erro ao atualizar notícia:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.updateNews = updateNews;
// Delete a news article by its ID
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await newsArticles_1.default.findByIdAndDelete(id);
        if (!result) {
            res.status(404).json({ message: "Notícia não encontrada" });
            return;
        }
        res.json({ message: "Notícia removida com sucesso" });
    }
    catch (err) {
        console.error("Erro ao deletar notícia:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.deleteNews = deleteNews;
