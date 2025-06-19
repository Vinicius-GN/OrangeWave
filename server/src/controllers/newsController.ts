import { Request, Response } from "express";
import News from "../models/newsArticles";

// List all news articles, sorted by most recent
export const listNews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const articles = await News.find().sort({ publishedAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error("Erro ao listar news:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Get a single news article by its ID
export const getNewsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await News.findById(id);
    if (!article) {
      res.status(404).json({ message: "Notícia não encontrada" });
      return;
    }
    res.json(article);
  } catch (err) {
    console.error("Erro ao obter news:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Create a new news article
export const createNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    const article = new News({ _id: `news-${new Date().getTime()}`, ...payload });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    console.error("Erro ao criar notícia:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Update an existing news article by its ID
export const updateNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const article = await News.findByIdAndUpdate(id, updates, { new: true });
    if (!article) {
      res.status(404).json({ message: "Notícia não encontrada" });
      return;
    }
    res.json(article);
  } catch (err) {
    console.error("Erro ao atualizar notícia:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

// Delete a news article by its ID
export const deleteNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await News.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ message: "Notícia não encontrada" });
      return;
    }
    res.json({ message: "Notícia removida com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar notícia:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};
