"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHistory = exports.createSnapshot = void 0;
const portfolioHistory_1 = __importDefault(require("../models/portfolioHistory"));
const portifolioAsset_1 = __importDefault(require("../models/portifolioAsset"));
const priceSnapshot_1 = __importDefault(require("../models/priceSnapshot"));
// Auxiliar para zerar hora de uma data (ficar só com ano/mês/dia)
function normalizeToMidnight(d) {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
}
/**
 * Cria ou atualiza um snapshot diário do valor total da carteira do usuário
 * endpoint privado (assume que algum job externo chama ou o próprio usuário dispara)
 * Rota: POST /portfolio-history/:userId
 * Body: { date?: string (ISO) }
 */
const createSnapshot = async (req, res) => {
    try {
        const { userId } = req.params;
        // Se data não for fornecida, usar hoje
        const rawDate = req.body.date ? new Date(req.body.date) : new Date();
        const date = normalizeToMidnight(rawDate);
        // 1) Busca todos os ativos do portfólio desse usuário
        const portfolioItems = await portifolioAsset_1.default.find({ userId });
        // Se não tiver ativo, total = 0
        if (!portfolioItems || portfolioItems.length === 0) {
            // Tenta criar/atualizar com valor zero
            await portfolioHistory_1.default.findOneAndUpdate({ userId, date }, { $set: { totalValue: 0 } }, { upsert: true, new: true });
            res.json({ userId, date, totalValue: 0 });
            return;
        }
        // 2) Para cada ativo: pegar o preço mais recente (diário) do PriceSnapshot
        let total = 0;
        for (const item of portfolioItems) {
            // Procurar último preço “day” para esse ativo antes ou igual à data
            const snapshot = await priceSnapshot_1.default.findOne({
                assetId: item.assetId,
                timeframe: "day",
                timestamp: { $lte: date }
            })
                .sort({ timestamp: -1 })
                .lean();
            const price = snapshot && typeof snapshot.price === "number" ? snapshot.price : 0;
            total += price * (item.quantity ?? 0);
        }
        // 3) Insere ou atualiza documento em PortfolioHistory
        const record = await portfolioHistory_1.default.findOneAndUpdate({ userId, date }, { $set: { totalValue: total } }, { upsert: true, new: true });
        res.json(record);
    }
    catch (err) {
        console.error("Erro ao criar snapshot de portfólio:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.createSnapshot = createSnapshot;
/**
 * Lista snapshots de portfólio de um usuário, filtrado por timeframe:
 * query param `timeframe` pode ser: “1W”, “1M”, “6M”, “1Y” ou undefined (retorna todos)
 * Exemplo: GET /portfolio-history/:userId?timeframe=1M
 */
const listHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeframe } = req.query;
        let cutoffDate = null;
        const today = normalizeToMidnight(new Date());
        switch (timeframe) {
            case "1W":
                cutoffDate = new Date(today);
                cutoffDate.setDate(today.getDate() - 7);
                break;
            case "1M":
                cutoffDate = new Date(today);
                cutoffDate.setMonth(today.getMonth() - 1);
                break;
            case "6M":
                cutoffDate = new Date(today);
                cutoffDate.setMonth(today.getMonth() - 6);
                break;
            case "1Y":
                cutoffDate = new Date(today);
                cutoffDate.setFullYear(today.getFullYear() - 1);
                break;
            default:
                cutoffDate = null;
        }
        const filter = { userId };
        if (cutoffDate) {
            filter.date = { $gte: cutoffDate, $lte: today };
        }
        const history = await portfolioHistory_1.default.find(filter)
            .sort({ date: 1 })
            .lean();
        res.json(history);
    }
    catch (err) {
        console.error("Erro ao listar histórico do portfólio:", err);
        res.status(500).json({ message: "Erro interno" });
    }
};
exports.listHistory = listHistory;
