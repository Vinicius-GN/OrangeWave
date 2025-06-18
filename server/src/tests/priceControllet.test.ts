/* src/tests/priceController.test.ts */
import request   from 'supertest';
import mongoose  from 'mongoose';
import app       from '../index';
import { connectDB } from '../config/database';
import PriceSnapshot from '../models/priceSnapshot';

const uniqueId   = 'asset-msft';                     // fixed id used only for tests
const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000);

/**
 * End-to-end tests for the Price Controller API endpoints
 * This suite tests price snapshot creation, retrieval, filtering, and cleanup for a test asset.
 */
describe('Price Controller (e2e)', () => {
  let token: string;

  jest.setTimeout(15_000);

  beforeAll(async () => {
    await connectDB();

    // 1. Ensure a test admin exists and obtain a JWT token for authentication
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
      // Accept 201 (created) or 400 (already exists) as valid responses
      .ok(res => res.status === 201 || res.status === 400);

    // Log in as the test admin to get a JWT token
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest+admin@gmail.com', password: 'senha123' });
    token = login.body.token;

    // 2. Remove any existing price snapshots for the test asset and insert three test snapshots
    await PriceSnapshot.deleteMany({ assetId: uniqueId });
    await PriceSnapshot.insertMany([
      { assetId: uniqueId, timeframe: 'hour',  timestamp: minutesAgo(30),        price: 100 },
      { assetId: uniqueId, timeframe: 'day',   timestamp: minutesAgo(60 * 24),   price: 110 },
      { assetId: uniqueId, timeframe: 'month', timestamp: minutesAgo(60 * 24*30),price: 120 }
    ]);
  });

  // Test: GET all price snapshots for the asset
  it('GET /api/prices/:assetId  → 3 snapshots', async () => {
    const res = await request(app).get(`/api/prices/${uniqueId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  // Test: Filter by timeframe (should return only one snapshot)
  it('Filtro timeframe=day → 1 snapshot', async () => {
    const res = await request(app)
      .get(`/api/prices/${uniqueId}`)
      .query({ timeframe: 'day' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].timeframe).toBe('day');
  });

  // Test: Get the latest snapshot for each timeframe
  it('GET /api/prices/:assetId/last → hour, day, month', async () => {
    const res = await request(app).get(`/api/prices/${uniqueId}/last`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    const frames = res.body.map((d: any) => d._id).sort();
    expect(frames).toEqual(['day', 'hour', 'month']);
  });

  // Clean up test data and close DB connection after all tests
  afterAll(async () => {
    await PriceSnapshot.deleteMany({ assetId: uniqueId }); // Remove test data
    await mongoose.disconnect();                           // Close DB connection
  });
});
