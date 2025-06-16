/* src/tests/priceController.test.ts */
import request   from 'supertest';
import mongoose  from 'mongoose';
import app       from '../index';
import { connectDB } from '../config/database';
import PriceSnapshot from '../models/priceSnapshot';

const uniqueId   = 'asset-msft';                     // id fixo usado apenas nos testes
const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000);

describe('Price Controller (e2e)', () => {
  let token: string;

  jest.setTimeout(15_000);

  beforeAll(async () => {
    await connectDB();

    /* ------------------------------------------------------------------ *
     * 1. Garante admin de testes e obtém o token
     * ------------------------------------------------------------------ */
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Jest Admin',
        email:    'jest+admin@gmail.com',
        password: 'senha123',
        phone:    '11999999999',
        role:     'admin',
        address:  {
          country: 'BR',
          state:   'SP',
          city:    'São Paulo',
          street:  'Rua Jest',
          number:  1
        }
      })
      /* se já existir o e-mail a resposta será 400 – consideramos OK */
      .ok(res => res.status === 201 || res.status === 400);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest+admin@gmail.com', password: 'senha123' });
    token = login.body.token;

    /* ------------------------------------------------------------------ *
     * 2. Remove snapshots que possam existir desse assetId
     *    e insere apenas os três que queremos validar
     * ------------------------------------------------------------------ */
    await PriceSnapshot.deleteMany({ assetId: uniqueId });

    await PriceSnapshot.insertMany([
      { assetId: uniqueId, timeframe: 'hour',  timestamp: minutesAgo(30),        price: 100 },
      { assetId: uniqueId, timeframe: 'day',   timestamp: minutesAgo(60 * 24),   price: 110 },
      { assetId: uniqueId, timeframe: 'month', timestamp: minutesAgo(60 * 24*30),price: 120 }
    ]);
  });

  /* -------------------------------------------------------------------- */
  it('GET /api/prices/:assetId  → 3 snapshots', async () => {
    const res = await request(app).get(`/api/prices/${uniqueId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('Filtro timeframe=day → 1 snapshot', async () => {
    const res = await request(app)
      .get(`/api/prices/${uniqueId}`)
      .query({ timeframe: 'day' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].timeframe).toBe('day');
  });

  it('GET /api/prices/:assetId/last → hour, day, month', async () => {
    const res = await request(app).get(`/api/prices/${uniqueId}/last`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    const frames = res.body.map((d: any) => d._id).sort();
    expect(frames).toEqual(['day', 'hour', 'month']);
  });

  /* -------------------------------------------------------------------- */
  afterAll(async () => {
    await PriceSnapshot.deleteMany({ assetId: uniqueId }); // limpa dados de teste
    await mongoose.disconnect();                           // encerra conexão
  });
});
