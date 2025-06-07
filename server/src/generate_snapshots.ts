/**
 * scripts/generatePriceSnapshots.ts
 * --------------------------------------------------------
 * Gera priceSnapshot.json para todos os ativos listados em assets.json
 *
 * • Intraday: marcações a cada 10 minutos de 10:00 até 16:00 do dia atual
 * • Dia útil: preço no final de cada dia (16:00) para cada dia útil dos últimos 30 dias
 * • Month: valor no dia 1 de cada mês dos últimos 12 meses (00:00)
 *
 * A variação é pseudo‐aleatória em torno do preço atual:
 *   – ±1% por marcação intraday
 *   – ±0.5% por marcação diária
 *   – ±5% por marcação mensal
 *
 * Uso:
 *   npx ts-node scripts/generatePriceSnapshots.ts
 *   # → atualiza scripts/seedData/priceSnapshot.json
 */

import fs from "fs/promises";
import path from "path";

interface Asset {
  _id: string;
  price: number;
}

const ASSETS_PATH = path.join("scripts", "seedData", "assets.json");
const OUTPUT_PATH = path.join("scripts", "seedData", "priceSnapshot.json");

/**
 * Varia o preço base em ±pct porcento, retornando com 2 casas decimais.
 */
const vary = (base: number, pct: number): number =>
  Number((base * (1 + pct / 100)).toFixed(2));

/**
 * Verifica se uma data é um dia útil (segunda=1 ... sexta=5)
 */
const isWeekday = (date: Date): boolean => {
  const d = date.getDay();
  return d >= 1 && d <= 5;
};

async function main() {
  // 1) Lê todos os ativos
  const assets: Asset[] = JSON.parse(
    await fs.readFile(ASSETS_PATH, "utf8")
  );

  const snapshots: {
    assetId: string;
    timeframe: "minute" | "day" | "month";
    timestamp: string;
    price: number;
  }[] = [];

  // 2) Data de referência "hoje", hora local zerada em minutos/segundos
  const today = new Date();
  today.setSeconds(0, 0);

  for (const asset of assets) {
    // ──────────────────────────────────────────────────
    // A) Intraday: de 10:00 a 16:00, a cada 10 minutos
    // ──────────────────────────────────────────────────
    const intradayDate = new Date(today);
    // Garante que intradayDate seja "hoje" às 00:00
    intradayDate.setHours(0, 0, 0, 0);

    for (let hour = 10; hour <= 16; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        // Se estivermos em 16h, só considere minute = 0
        if (hour === 16 && minute > 0) break;

        const ts = new Date(intradayDate);
        ts.setHours(hour, minute, 0, 0);

        // Se for no futuro, pule (por ex. se rodar antes das 16:00)
        if (ts.getTime() > new Date().getTime()) continue;

        // variação ±1%
        const pct = (Math.random() - 0.5) * 2;
        snapshots.push({
          assetId: asset._id,
          timeframe: "minute",
          timestamp: ts.toISOString(),
          price: vary(asset.price, pct),
        });
      }
    }

    // ──────────────────────────────────────────────────
    // B) Daily: preço final de cada dia útil dos últimos 30 dias
    // ──────────────────────────────────────────────────
    const now = new Date();
    // Itera de 30 dias atrás até hoje
    for (let offset = 30; offset >= 0; offset--) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      d.setHours(16, 0, 0, 0); // fim de pregão às 16:00

      if (!isWeekday(d)) continue;

      // variação ±0.5%
      const pct = (Math.random() - 0.5);
      snapshots.push({
        assetId: asset._id,
        timeframe: "day",
        timestamp: d.toISOString(),
        price: vary(asset.price, pct),
      });
    }

    // ──────────────────────────────────────────────────
    // C) Monthly: dia 1 de cada um dos últimos 12 meses às 00:00
    // ──────────────────────────────────────────────────
    const baseMonth = new Date(now);
    baseMonth.setDate(1);
    baseMonth.setHours(0, 0, 0, 0);

    for (let m = 11; m >= 0; m--) {
      const d = new Date(baseMonth);
      d.setMonth(baseMonth.getMonth() - m);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);

      // variação ±5%
      const pct = (Math.random() - 0.5) * 10;
      snapshots.push({
        assetId: asset._id,
        timeframe: "month",
        timestamp: d.toISOString(),
        price: vary(asset.price, pct),
      });
    }
  }

  // 3) Escreve no arquivo JSON
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(snapshots, null, 2), "utf8");
  console.log(`✅ Gerado ${snapshots.length} snapshots em ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error("Erro ao gerar snapshots:", e);
  process.exit(1);
});
