/* src/tests/newsController.test.ts */
import request     from 'supertest';
import mongoose    from 'mongoose';
import app         from '../index';
import { connectDB } from '../config/database';
import News        from '../models/newsArticles';

const newsTestId = `news-test-${Date.now()}`;

describe('News Controller (e2e)', () => {
  let token: string;

  jest.setTimeout(15_000);

  beforeAll(async () => {
    await connectDB();

    /* garante admin ------------------------------------------------ */
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Jest Admin',
        email:    'jest+admin@gmail.com',
        password: 'senha123',
        phone:    '11999999999',
        role:     'admin',
        address:  {
          country: 'BR', state: 'SP', city: 'São Paulo',
          street: 'Rua Jest', number: 1
        }
      })
      .ok(r => r.status === 201 || r.status === 400);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest+admin@gmail.com', password: 'senha123' });
    token = login.body.token;

    await News.deleteOne({ _id: newsTestId });
  });

  /* ─────────────────────────────────────────────────────────────── */

  it('POST /api/news → cria notícia (201)', async () => {
    const payload = {
      _id:          newsTestId,
      title:        'Artigo Jest',
      summary:      'Resumo do Jest',
      content:      '<p>Conteúdo de teste</p>',
      imageUrl:     'https://placehold.co/600x400',
      publishedAt:  new Date().toISOString(),
      category:     'crypto',        // ✅ categoria dentro do enum
      source:       'jest-source',
      relatedAssets:['asset-aapl']
    };

    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id', newsTestId);
  });

  it('GET /api/news → lista contém o artigo', async () => {
    const res = await request(app).get('/api/news');
    expect(res.status).toBe(200);
    const found = res.body.some((n: any) => n._id === newsTestId);
    expect(found).toBe(true);
  });

  it('GET /api/news/:id → obtém artigo', async () => {
    const res = await request(app).get(`/api/news/${newsTestId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', newsTestId);
  });

  it('PUT /api/news/:id → atualiza título', async () => {
    const res = await request(app)
      .put(`/api/news/${newsTestId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Título Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Título Atualizado');
  });

  it('DELETE /api/news/:id → remove artigo', async () => {
    const res = await request(app)
      .delete(`/api/news/${newsTestId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Notícia removida com sucesso');

    /* garante remoção */
    const follow = await request(app).get(`/api/news/${newsTestId}`);
    expect(follow.status).toBe(404);
  });

  /* ─────────────────────────────────────────────────────────────── */
  afterAll(async () => {
    await News.deleteOne({ _id: newsTestId });
    await mongoose.disconnect();
  });
});
