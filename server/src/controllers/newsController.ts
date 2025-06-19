/**
 * @file newsController.ts
 * @brief Controller for news article management: list, get, create, update, and delete articles.
 *
 * This file defines controller functions for handling news article operations,
 * including listing all articles, retrieving, creating, updating, and deleting news by ID.
 */

import { Request, Response } from "express";
import News from "../models/newsArticles";

/**
 * @brief List all news articles, sorted by most recent.
 *
 * @param _req HTTP request (unused).
 * @param res HTTP response.
 * @returns Array of news articles.
 */
export const listNews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const articles = await News.find().sort({ publishedAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error("Erro ao listar news:", err);
    res.status(500).json({ message: "Erro interno" });
  }
};

/**
 * @brief Get a single news article by its ID.
 *
 * @param req HTTP request with news article ID in params.
 * @param res HTTP response.
 * @returns The requested news article or 404 if not found.
 */
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

/**
 * @brief Create a new news article.
 *
 * @param req HTTP request containing article details in the body.
 * @param res HTTP response.
 * @returns The newly created news article.
 */
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

/**
 * @brief Update an existing news article by its ID.
 *
 * @param req HTTP request with news article ID in params and updated data in the body.
 * @param res HTTP response.
 * @returns The updated news article or 404 if not found.
 */
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

/**
 * @brief Delete a news article by its ID.
 *
 * @param req HTTP request with news article ID in params.
 * @param res HTTP response.
 * @returns Success message or 404 if not found.
 */
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
