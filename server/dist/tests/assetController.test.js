"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../index")); // server exported in index.ts
const database_1 = require("../config/database");
// End-to-end tests for the Asset Controller API endpoints
// This suite tests asset creation, retrieval, update, deletion, and cleanup.
describe('Asset Controller (e2e)', () => {
    let token;
    let assetId; // _id generated during creation
    const symbol = `TST${Date.now()}`; // ensures a unique symbol
    jest.setTimeout(15000); // Increase timeout for slow CI environments
    // ------------------------------------------------------------
    // SET-UP: Connect to DB, register/login admin, and obtain token
    // ------------------------------------------------------------
    beforeAll(async () => {
        await (0, database_1.connectDB)();
        // Register a test admin if not already present
        await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/register')
            .send({
            fullName: 'Jest Admin',
            email: 'jest+admin@gmail.com',
            password: 'senha123',
            phone: '11999999999',
            address: { country: 'BR', state: 'SP', city: 'São Paulo', street: 'Rua Teste', number: 1 },
            role: 'admin'
        })
            // Accept 201 (created) or 400 (already exists) as valid responses
            .ok(res => res.status === 201 || res.status === 400); // 400 => already exists
        // Log in as the test admin to get a JWT token
        const login = await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/login')
            .send({ email: 'jest+admin@gmail.com', password: 'senha123' });
        token = login.body.token;
    });
    // ------------------------------------------------------------
    // T1 – Create a sandbox asset just for this suite
    // ------------------------------------------------------------
    // Test: Create a new asset for this suite
    it('POST /api/assets – should create a new asset', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/assets')
            .set('Authorization', `Bearer ${token}`)
            .send({
            _id: `asset-${Date.now()}`,
            symbol, // unique symbol
            name: 'Test Inc.',
            type: 'stock',
            price: 100,
            marketCap: 1000000000,
            availableStock: 500,
            volume: 10000
        });
        expect(res.status).toBe(201);
        expect(res.body.symbol).toBe(symbol);
        assetId = res.body._id; // Save for later tests
    });
    // ------------------------------------------------------------
    // T2 – List all assets
    // ------------------------------------------------------------
    // Test: List all assets and check if the response is an array
    it('GET /api/assets – should return an array', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/assets');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
    // ------------------------------------------------------------
    // T3 – Retrieve by _id and by symbol
    // ------------------------------------------------------------
    // Test: Retrieve asset by _id and by symbol
    it('GET /api/assets/:identifier – by id & by symbol', async () => {
        // By id
        const resById = await (0, supertest_1.default)(index_1.default).get(`/api/assets/${assetId}`);
        expect(resById.status).toBe(200);
        expect(resById.body._id).toBe(assetId);
        // By symbol
        const resBySymbol = await (0, supertest_1.default)(index_1.default).get(`/api/assets/${symbol}`);
        expect(resBySymbol.status).toBe(200);
        expect(resBySymbol.body.symbol).toBe(symbol);
    });
    // ------------------------------------------------------------
    // T4 – Update asset
    // ------------------------------------------------------------
    // Test: Update asset price and available stock
    it('PUT /api/assets/:identifier – update price and stock', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .put(`/api/assets/${assetId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ price: 150, availableStock: 450 });
        expect(res.status).toBe(200);
        expect(res.body.price).toBe(150);
        expect(res.body.availableStock).toBe(450);
    });
    // ------------------------------------------------------------
    // T5 – Delete asset and check 404 on subsequent delete
    // ------------------------------------------------------------
    // Test: Delete asset and ensure 404 on subsequent delete
    it('DELETE /api/assets/:identifier – remove asset', async () => {
        const del = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/assets/${assetId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(del.status).toBe(200);
        expect(del.body.message).toBe('Asset removido com sucesso');
        // Try deleting again (should return 404)
        const delAgain = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/assets/${assetId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(delAgain.status).toBe(404);
        expect(delAgain.body.message).toBe('Asset não encontrado');
    });
    // ------------------------------------------------------------
    // TEAR-DOWN: Close DB connections
    // ------------------------------------------------------------
    // Clean up: close DB connection after all tests
    afterAll(async () => {
        await mongoose_1.default.connection.close();
    });
});
