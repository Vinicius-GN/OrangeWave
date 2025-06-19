"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* src/tests/newsController.test.ts */
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../index"));
const database_1 = require("../config/database");
const newsArticles_1 = __importDefault(require("../models/newsArticles"));
const newsTestId = `news-test-${Date.now()}`;
/**
 * End-to-end tests for the News Controller API endpoints
 * This suite tests news article creation, retrieval, update, deletion, and cleanup.
 */
describe('News Controller (e2e)', () => {
    let token;
    jest.setTimeout(15000);
    beforeAll(async () => {
        await (0, database_1.connectDB)();
        // Ensure a test admin exists and obtain a JWT token for authentication
        await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/register')
            .send({
            fullName: 'Jest Admin',
            email: 'jest+admin@gmail.com',
            password: 'senha123',
            phone: '11999999999',
            role: 'admin',
            address: {
                country: 'BR', state: 'SP', city: 'São Paulo',
                street: 'Rua Jest', number: 1
            }
        })
            // Accept 201 (created) or 400 (already exists) as valid responses
            .ok(r => r.status === 201 || r.status === 400);
        // Log in as the test admin to get a JWT token
        const login = await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/login')
            .send({ email: 'jest+admin@gmail.com', password: 'senha123' });
        token = login.body.token;
        // Remove any existing test news article
        await newsArticles_1.default.deleteOne({ _id: newsTestId });
    });
    // Test: Create a news article
    it('POST /api/news → cria notícia (201)', async () => {
        const payload = {
            _id: newsTestId,
            title: 'Artigo Jest',
            summary: 'Resumo do Jest',
            content: '<p>Conteúdo de teste</p>',
            imageUrl: 'https://placehold.co/600x400',
            publishedAt: new Date().toISOString(),
            category: 'crypto', // Valid enum category
            source: 'jest-source',
            relatedAssets: ['asset-aapl']
        };
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/news')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id', newsTestId);
    });
    // Test: List all news articles and check if the created article is present
    it('GET /api/news → lista contém o artigo', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/news');
        expect(res.status).toBe(200);
        const found = res.body.some((n) => n._id === newsTestId);
        expect(found).toBe(true);
    });
    // Test: Retrieve the created news article by ID
    it('GET /api/news/:id → obtém artigo', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get(`/api/news/${newsTestId}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('_id', newsTestId);
    });
    // Test: Update the news article's title
    it('PUT /api/news/:id → atualiza título', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .put(`/api/news/${newsTestId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Título Atualizado' });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Título Atualizado');
    });
    // Test: Delete the news article and ensure it is removed
    it('DELETE /api/news/:id → remove artigo', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/news/${newsTestId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Notícia removida com sucesso');
        // Ensure the article is actually deleted
        const follow = await (0, supertest_1.default)(index_1.default).get(`/api/news/${newsTestId}`);
        expect(follow.status).toBe(404);
    });
    // Clean up test data and close DB connection after all tests
    afterAll(async () => {
        await newsArticles_1.default.deleteOne({ _id: newsTestId });
        await mongoose_1.default.disconnect();
    });
});
