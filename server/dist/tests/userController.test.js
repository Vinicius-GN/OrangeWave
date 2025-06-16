"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index")); // Express app exportado em index.ts
const database_1 = require("../config/database");
const user_1 = __importDefault(require("../models/user"));
describe('User Controller (e2e)', () => {
    let token;
    let testUser;
    /* aumente o timeout global da suíte */
    jest.setTimeout(15000);
    beforeAll(async () => {
        await (0, database_1.connectDB)();
        // 1) registra (se ainda não existir)
        await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/register')
            .send({
            fullName: 'Jest User',
            email: 'admin@gmail.com',
            password: 'senha123',
            phone: '11999999999',
            address: {
                country: 'BR',
                state: 'SP',
                city: 'São Paulo',
                street: 'Rua Teste',
                number: 42
            }
        })
            // se já existir recebemos 400; não falhe nesse caso
            .ok(res => res.status === 201 || res.status === 400);
        // 2) login
        const loginRes = await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'senha123' });
        token = loginRes.body.token;
        // 3) carrega usuário para ter o _id
        testUser = await user_1.default.findOne({ email: 'admin@gmail.com' });
    });
    /* ------------------------------------------------------------ */
    it('GET /api/users/me – autenticado devolve dados', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            _id: testUser._id.toString(),
            email: 'admin@gmail.com'
        });
    });
    it('GET /api/users/me – sem token devolve 401', async () => {
        const res = await (0, supertest_1.default)(index_1.default).get('/api/users/me');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Token ausente');
    });
    it('PUT /api/users/:id – admin atualiza nome e telefone', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .put(`/api/users/${testUser._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ fullName: 'Jest User Updated', phone: '11888888888' });
        expect(res.status).toBe(200);
        expect(res.body.fullName).toBe('Jest User Updated');
        expect(res.body.phone).toBe('11888888888');
    });
    it('DELETE /api/users/unknown – retorna 404', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/users/64a000000000000000000000')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Usuário não encontrado');
    });
    it('POST /api/users/change-password – resetar senha via e-mail', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/users/change-password')
            .send({ email: 'jest+user@gmail.com', newPassword: 'nova123' });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Senha alterada com sucesso');
    });
});
