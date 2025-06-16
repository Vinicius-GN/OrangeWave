"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* src/tests/priceController.test.ts */
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../index"));
const database_1 = require("../config/database");
const priceSnapshot_1 = __importDefault(require("../models/priceSnapshot"));
const uniqueId = 'asset-msft'; // id fixo usado apenas nos testes
const minutesAgo = (n) => new Date(Date.now() - n * 60000);
describe('Price Controller (e2e)', () => {
    let token;
    jest.setTimeout(15000);
    beforeAll(async () => {
        await (0, database_1.connectDB)();
        /* ------------------------------------------------------------------ *
         * 1. Garante admin de testes e obtém o token
         * ------------------------------------------------------------------ */
        await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/register')
            .send({
            fullName: 'Jest Admin',
            email: 'jest+admin@gmail.com',
            password: 'senha123',
            phone: '11999999999',
            role: 'admin',
            address: {
                country: 'BR',
                state: 'SP',
                city: 'São Paulo',
                street: 'Rua Jest',
                number: 1
            }
        })
            /* se já existir o e-mail a resposta será 400 – consideramos OK */
            .ok(res => res.status === 201 || res.status === 400);
        const login = await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/login')
            .send({ email: 'jest+admin@gmail.com', password: 'senha123' });
        token = login.body.token;
        /* ------------------------------------------------------------------ *
         * 2. Remove snapshots que possam existir desse assetId
         *    e insere apenas os três que queremos validar
         * ------------------------------------------------------------------ */
        await priceSnapshot_1.default.deleteMany({ assetId: uniqueId });
        await priceSnapshot_1.default.insertMany([
            { assetId: uniqueId, timeframe: 'hour', timestamp: minutesAgo(30), price: 100 },
            { assetId: uniqueId, timeframe: 'day', timestamp: minutesAgo(60 * 24), price: 110 },
            { assetId: uniqueId, timeframe: 'month', timestamp: minutesAgo(60 * 24 * 30), price: 120 }
        ]);
    });
    /* -------------------------------------------------------------------- */
    it('GET /api/prices/:assetId  → 3 snapshots', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get(`/api/prices/${uniqueId}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);
    });
    it('Filtro timeframe=day → 1 snapshot', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get(`/api/prices/${uniqueId}`)
            .query({ timeframe: 'day' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].timeframe).toBe('day');
    });
    it('GET /api/prices/:assetId/last → hour, day, month', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get(`/api/prices/${uniqueId}/last`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);
        const frames = res.body.map((d) => d._id).sort();
        expect(frames).toEqual(['day', 'hour', 'month']);
    });
    /* -------------------------------------------------------------------- */
    afterAll(async () => {
        await priceSnapshot_1.default.deleteMany({ assetId: uniqueId }); // limpa dados de teste
        await mongoose_1.default.disconnect(); // encerra conexão
    });
});
