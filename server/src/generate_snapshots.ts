import fs from "fs/promises";
import path from "path";

interface Asset {
  _id: string;
  price: number;
}

const ASSETS_PATH = path.join("scripts", "seedData", "assets.json");
const OUTPUT_PATH = path.join("scripts", "seedData", "priceSnapshot.json");

const vary = (base: number, pct: number): number =>
  Number((base * (1 + pct / 100)).toFixed(2));

async function main() {
  const assets: Asset[] = JSON.parse(
    await fs.readFile(ASSETS_PATH, "utf8")
  );

  const snapshots: {
    assetId: string;
    timeframe: "minute" | "day" | "month";
    timestamp: string;
    price: number;
  }[] = [];

  const now = new Date();
  now.setSeconds(0, 0);

  for (const asset of assets) {
    // ───────────────────────────────────────────────
    // A) Intraday: 10 pontos distribuídos ao longo do dia atual
    // ───────────────────────────────────────────────
    const intradayBase = new Date(now);
    intradayBase.setHours(9, 0, 0, 0);

    for (let i = 0; i < 10; i++) {
      const ts = new Date(intradayBase);
      ts.setMinutes(ts.getMinutes() + i * 60); // 1 ponto por hora

      if (ts.getTime() > Date.now()) break;

      const pct = (Math.random() - 0.5) * 6; // ±3%
      snapshots.push({
        assetId: asset._id,
        timeframe: "minute",
        timestamp: ts.toISOString(),
        price: vary(asset.price, pct),
      });
    }

    // ───────────────────────────────────────────────
    // B) Diário: 30 dias consecutivos (inclui finais de semana)
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
    // C) Mensal: 1 ponto no dia 1 de cada um dos últimos 12 meses
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

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(snapshots, null, 2), "utf8");
  console.log(`✅ Gerado ${snapshots.length} snapshots em ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error("Erro ao gerar snapshots:", e);
  process.exit(1);
});
