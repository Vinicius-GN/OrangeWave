import request  from 'supertest';
import mongoose from 'mongoose';
import app      from '../index';                    // server exportado em index.ts
import { connectDB} from '../config/database';

describe('Asset Controller (e2e)', () => {
  let token:    string;
  let assetId:  string;  // _id gerado na criação
  const symbol = `TST${Date.now()}`; // garante símbolo único

  jest.setTimeout(15_000);           // CI lentos → timeout maior

  /* ------------------------------------------------------------ */
  /*  SET-UP: conecta, faz login/registro e obtém token            */
  /* ------------------------------------------------------------ */
  beforeAll(async () => {
    await connectDB();

    /* registra admin se ainda não existir --------------------- */
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Jest Admin',
        email:    'jest+admin@gmail.com',
        password: 'senha123',
        phone:    '11999999999',
        address:  { country:'BR', state:'SP', city:'São Paulo', street:'Rua Teste', number: 1 },
        role:     'admin'
      })
      .ok(res => res.status === 201 || res.status === 400);  // 400 => já existe

    /* login para obter JWT ------------------------------------ */
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest+admin@gmail.com', password: 'senha123' });

    token = login.body.token;
  });

  /* ------------------------------------------------------------ */
  /*  T1  – cria ativo “sandbox” apenas para esta suíte            */
  /* ------------------------------------------------------------ */
  it('POST /api/assets – deve criar novo asset', async () => {
    const res = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        _id:            `asset-${Date.now()}`,
        symbol,                           // único
        name:           'Test Inc.',
        type:           'stock',
        price:          100,
        marketCap:      1_000_000_000,
        availableStock: 500,
        volume:         10_000
      });

    expect(res.status).toBe(201);
    expect(res.body.symbol).toBe(symbol);

    assetId = res.body._id;            // salva para os próximos testes
  });

  /* ------------------------------------------------------------ */
  /*  T2 – listar todos                                           */
  /* ------------------------------------------------------------ */
  it('GET /api/assets – lista deve conter array', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  /* ------------------------------------------------------------ */
  /*  T3 – obter por _id e por symbol                             */
  /* ------------------------------------------------------------ */
  it('GET /api/assets/:identifier – por id & por symbol', async () => {
    /* por id */
    const resById = await request(app).get(`/api/assets/${assetId}`);
    expect(resById.status).toBe(200);
    expect(resById.body._id).toBe(assetId);

    /* por symbol */
    const resBySymbol = await request(app).get(`/api/assets/${symbol}`);
    expect(resBySymbol.status).toBe(200);
    expect(resBySymbol.body.symbol).toBe(symbol);
  });

  /* ------------------------------------------------------------ */
  /*  T4 – atualizar                                              */
  /* ------------------------------------------------------------ */
  it('PUT /api/assets/:identifier – atualiza preço e estoque', async () => {
    const res = await request(app)
      .put(`/api/assets/${assetId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 150, availableStock: 450 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(150);
    expect(res.body.availableStock).toBe(450);
  });

  /* ------------------------------------------------------------ */
  /*  T5 – deletar e 404 subsequente                              */
  /* ------------------------------------------------------------ */
  it('DELETE /api/assets/:identifier – remove asset', async () => {
    const del = await request(app)
      .delete(`/api/assets/${assetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(200);
    expect(del.body.message).toBe('Asset removido com sucesso');

    /* tentar deletar de novo → 404 */
    const delAgain = await request(app)
      .delete(`/api/assets/${assetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delAgain.status).toBe(404);
    expect(delAgain.body.message).toBe('Asset não encontrado');
  });

  /* ------------------------------------------------------------ */
  /*  TEAR-DOWN: encerra conexões                                 */
  /* ------------------------------------------------------------ */
  afterAll(async () => {
    await mongoose.connection.close();
  });
});
