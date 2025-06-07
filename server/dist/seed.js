"use strict";
/**
 * scripts/seed.js
 * --------------------------------------------------
 * Popula o MongoDB Atlas com todos os documentos de
 * assets, users, news, wallets, walletTransactions,
 * portfolioAssets, marketOrders e priceSnapshots.
 *
 * • Usa Mongoose direto (sem dependência do servidor)
 * • Remove a coleção antes de inserir (idempotente)
 * • Lê variáveis do .env   (MONGODB_URI)
 * --------------------------------------------------
 */
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
// ──────────────────── util ──────────────────────
// função para carregar um arquivo JSON corretamente
const loadJSON = async (fileName) => {
    const filePath = path.join("scripts/seedData", fileName);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
};
// ────────────────── modelos ─────────────────────
const Asset = require("./models/assets.js").default;
const User = require("./models/user.js").default;
const News = require("./models/newsArticles.js").default;
const Wallet = require("./models/wallet.js").default;
const WalletTx = require("./models/wallet_transactions.js").default;
const PortfolioAsset = require("./models/portifolioAsset.js").default;
const MarketOrder = require("./models/marketOrder.js").default;
const PriceSnapshot = require("./models/priceSnapshot.js").default;
const PortfolioHistory = require("./models/portfolioHistory.js").default;
// lista de coleções/arquivos p/ iterar
const collections = [
    { model: Asset, file: "assets.json" },
    { model: User, file: "users.json" },
    { model: News, file: "news.json" },
    { model: Wallet, file: "wallets.json" },
    { model: WalletTx, file: "walletTransactions.json" },
    { model: PortfolioAsset, file: "portifolioAssets.json" },
    { model: MarketOrder, file: "marketOrders.json" },
    { model: PriceSnapshot, file: "priceSnapshot.json" },
    { model: PortfolioHistory, file: "portfolioHistory.json" }
];
// ────────────────────────────────────────────────
(async function seed() {
    try {
        /* 1. conectar */
        await mongoose.connect(process.env.MONGODB_URI, {
            connectTimeoutMS: 10000
        });
        console.log("✅  MongoDB conectado");
        /* 2. importar cada arquivo */
        for (const { model, file } of collections) {
            const data = await loadJSON(file);
            await model.deleteMany();
            await model.insertMany(data);
            console.log(`• ${file}  →  ${data.length} docs`);
        }
        console.log("🚀  Seed concluído com sucesso.");
        process.exit(0);
    }
    catch (err) {
        console.error("❌  Erro no seed:", err);
        process.exit(1);
    }
})();
