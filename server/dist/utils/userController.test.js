"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index")); // Certifique-se de importar corretamente o app do Express
const database_1 = require("../config/database"); // Funções para conectar e desconectar do banco
describe('User Controller Tests', () => {
    let token;
    let userId;
    beforeAll(async () => {
        // Conectar ao banco antes dos testes
        await (0, database_1.connectDB)();
        // Criar um usuário para realizar o login
        const response = await (0, supertest_1.default)(index_1.default)
            .post('/auth/register')
            .send({
            fullName: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            phone: '1234567890',
        });
        token = response.body.token; // Armazenar o token para os testes
        userId = response.body._id; // Armazenar o userId para testes subsequentes
    });
    afterAll(async () => {
        // Desconectar do banco depois dos testes
        await (0, database_1.disconnectDB)();
    });
    it('should return user data when logged in', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .get('/users/me')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('fullName', 'Test User');
        expect(response.body).toHaveProperty('email', 'testuser@example.com');
    });
    it('should return 401 if not authenticated', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .get('/users/me'); // Sem o token
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Usuário não autenticado');
    });
    it('should update user details', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
            fullName: 'Updated Test User',
            phone: '9876543210',
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('fullName', 'Updated Test User');
        expect(response.body).toHaveProperty('phone', '9876543210');
    });
    it('should return 403 if trying to update super admin', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .put('/users/superadmin-id')
            .set('Authorization', `Bearer ${token}`)
            .send({
            fullName: 'Super Admin',
        });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Este usuário não pode ser alterado.');
    });
    it('should delete a user', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Usuário removido com sucesso');
    });
    it('should return 404 if user not found during deletion', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .delete('/users/non-existent-id')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Usuário não encontrado');
    });
    it('should reset password successfully', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .post('/users/reset-password')
            .send({
            email: 'testuser@example.com',
            newPassword: 'newpassword123',
        });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Senha alterada com sucesso');
    });
    it('should return 404 if email is not registered for reset password', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .post('/users/reset-password')
            .send({
            email: 'nonexistentuser@example.com',
            newPassword: 'newpassword123',
        });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Usuário não encontrado');
    });
});
