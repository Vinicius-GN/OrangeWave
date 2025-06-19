/**
 * @file seed.js
 * @brief Populates MongoDB Atlas with all documents for assets, users, news, wallets, walletTransactions,
 * portfolioAssets, marketOrders, and priceSnapshots.
 *
 * - Uses Mongoose directly (no dependency on the server)
 * - Removes the collection before inserting (idempotent)
 * - Reads variables from .env (MONGODB_URI)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");

/**
 * @brief Utility function to properly load a JSON file.
 * @param fileName Name of the JSON file to load.
 * @returns {Promise<any>} Parsed JSON content from the file.
 */
const loadJSON = async (fileName) => {
  const filePath = path.join("scripts/seedData", fileName);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
};

// ────────────────── Models ─────────────────────
const Asset = require("./models/assets.js").default;
const User = require("./models/user.js").default;
const News = require("./models/newsArticles.js").default;
const Wallet = require("./models/wallet.js").default;
const WalletTx = require("./models/wallet_transactions.js").default;
const PortfolioAsset = require("./models/portifolioAsset.js").default;
const MarketOrder = require("./models/marketOrder.js").default;
const PriceSnapshot = require("./models/priceSnapshot.js").default;
const PortfolioHistory = require("./models/portfolioHistory.js").default; 

/**
 * @brief List of collections/files to iterate for seeding the database.
 */
const collections = [
  { model: Asset,                file: "assets.json" },
  { model: User,                 file: "users.json" },
  { model: News,                 file: "news.json" },
  { model: Wallet,               file: "wallets.json" },
  { model: WalletTx,             file: "walletTransactions.json" },
  { model: PortfolioAsset,       file: "portifolioAssets.json" },
  { model: MarketOrder,          file: "marketOrders.json" },
  { model: PriceSnapshot,        file: "priceSnapshot.json" },
  { model: PortfolioHistory,     file: "portfolioHistory.json" } 
];

// ────────────────────────────────────────────────

/**
 * @brief Main seeding function. Connects to MongoDB, clears collections, and populates with new data.
 *
 * 1. Connect to MongoDB using URI from .env.
 * 2. Import each file, clear the corresponding collection, and insert all documents.
 * 3. Log progress and exit.
 */
(async function seed() {
  try {
    // 1. Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      connectTimeoutMS: 10_000
    });
    console.log("✅  MongoDB connected");

    // 2. Import each file/collection
    for (const { model, file } of collections) {
      const data = await loadJSON(file);
      await model.deleteMany();
      await model.insertMany(data);
      console.log(`• ${file}  →  ${data.length} docs`);
    }

    console.log("🚀  Seed completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌  Error in seed:", err);
    process.exit(1);
  }
})();
