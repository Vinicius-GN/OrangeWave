"use strict";
/**
 * @file generatePriceSnapshots.ts
 * @brief Script to generate and save simulated price snapshots for assets.
 *
 * Reads asset data from a JSON file, generates randomized price snapshots for each asset
 * at various timeframes (intraday, daily, monthly), and writes the results to an output file.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/**
 * @brief Path to the input JSON file containing asset data.
 */
const ASSETS_PATH = path_1.default.join("scripts", "seedData", "assets.json");
/**
 * @brief Path to the output JSON file where price snapshots will be saved.
 */
const OUTPUT_PATH = path_1.default.join("scripts", "seedData", "priceSnapshot.json");
/**
 * @brief Utility function to apply a percentage variation to a base price.
 * @param base Base price.
 * @param pct Percentage variation (can be negative).
 * @returns Price with applied variation, rounded to 2 decimals.
 */
const vary = (base, pct) => Number((base * (1 + pct / 100)).toFixed(2));
/**
 * @brief Main function that generates and saves price snapshots.
 */
async function main() {
    const assets = JSON.parse(await promises_1.default.readFile(ASSETS_PATH, "utf8"));
    const snapshots = [];
    const now = new Date();
    now.setSeconds(0, 0);
    for (const asset of assets) {
        // ───────────────────────────────────────────────
        // A) Intraday: 10 points spread throughout the current day
        // ───────────────────────────────────────────────
        const intradayBase = new Date(now);
        intradayBase.setHours(9, 0, 0, 0);
        for (let i = 0; i < 10; i++) {
            const ts = new Date(intradayBase);
            ts.setMinutes(ts.getMinutes() + i * 60); // 1 point per hour
            if (ts.getTime() > Date.now())
                break;
            const pct = (Math.random() - 0.5) * 6; // ±3%
            snapshots.push({
                assetId: asset._id,
                timeframe: "minute",
                timestamp: ts.toISOString(),
                price: vary(asset.price, pct),
            });
        }
        // ───────────────────────────────────────────────
        // B) Daily: 30 consecutive days (including weekends)
        // ───────────────────────────────────────────────
        for (let i = 0; i < 30; i++) {
            const ts = new Date(now);
            ts.setDate(ts.getDate() - i);
            ts.setHours(16, 0, 0, 0);
            const pct = (Math.random() - 0.5) * 4; // ±2%
            snapshots.push({
                assetId: asset._id,
                timeframe: "day",
                timestamp: ts.toISOString(),
                price: vary(asset.price, pct),
            });
        }
        // ───────────────────────────────────────────────
        // C) Monthly: 1 point on the 1st of each of the last 12 months
        // ───────────────────────────────────────────────
        const baseMonth = new Date(now);
        baseMonth.setDate(1);
        baseMonth.setHours(0, 0, 0, 0);
        for (let i = 0; i < 12; i++) {
            const ts = new Date(baseMonth);
            ts.setMonth(baseMonth.getMonth() - i);
            const pct = (Math.random() - 0.5) * 20; // ±10%
            snapshots.push({
                assetId: asset._id,
                timeframe: "month",
                timestamp: ts.toISOString(),
                price: vary(asset.price, pct),
            });
        }
    }
    await promises_1.default.writeFile(OUTPUT_PATH, JSON.stringify(snapshots, null, 2), "utf8");
    console.log(`✅ Gerado ${snapshots.length} snapshots em ${OUTPUT_PATH}`);
}
main().catch((e) => {
    console.error("Erro ao gerar snapshots:", e);
    process.exit(1);
});
