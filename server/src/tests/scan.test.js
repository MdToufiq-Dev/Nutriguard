import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import pool from '../db/pool.js';
import config from '../config/env.js';
import jwt from 'jsonwebtoken';
import { UserConstraintsModel } from '../db/models/userConstraints.js';

describe('Scan & Safety Evaluator API', () => {
  const userId = config.devUserId;
  const authHeader = () => `Bearer ${jwt.sign({ userId, email: 'dev@example.com' }, config.jwtSecret)}`;

  if (config.authMode !== 'jwt') {
    throw new Error('Backend tests require AUTH_MODE=jwt');
  }

  beforeEach(async () => {
    await pool.query('DELETE FROM plan_meals');
    await pool.query('DELETE FROM plans');
    await pool.query('DELETE FROM compliance');
    await pool.query('DELETE FROM user_constraints');
    await pool.query('DELETE FROM scan_history');
    await pool.query('DELETE FROM users WHERE email = $1', ['dev@example.com']);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await pool.query(
      'INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email',
      [userId, 'dev@example.com']
    );
  });

  it('GET /api/scan/lookup/:barcode returns safe for non-conflicting product', async () => {
    // User with vegan diet
    await UserConstraintsModel.upsert(userId, {
      goal: 'weight-loss',
      diet_type: 'vegan',
      daily_budget: 15,
      calorie_target: 2000,
      meal_timings: {},
    });

    // 012345678905 is Quinoa (vegan)
    const res = await request(app)
      .get('/api/scan/lookup/012345678905')
      .set('Authorization', authHeader());
    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe('Quinoa (dry)');
    expect(res.body.safety.safe).toBe(true);
    expect(res.body.safety.severity).toBe('safe');
  });

  it('GET /api/scan/lookup/:barcode flags warning/blocked for conflicting products', async () => {
    // User with dairy allergy
    await UserConstraintsModel.upsert(userId, {
      goal: 'muscle-gain',
      diet_type: 'any',
      daily_budget: 20,
      calorie_target: 2500,
      meal_timings: {},
    });

    // 012345678904 is Greek Yogurt (dairy)
    const res = await request(app)
      .get('/api/scan/lookup/012345678904')
      .set('Authorization', authHeader());
    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe('Greek Yogurt Plain');
    expect(res.body.product.allergens).toContain('dairy');
  });

  it('POST /api/scan/history and GET /api/scan/history', async () => {
    const postRes = await request(app)
      .post('/api/scan/history')
      .set('Authorization', authHeader())
      .send({
        barcode: '012345678901',
        verdict: 'safe',
      });

    expect(postRes.status).toBe(201);
    expect(postRes.body.barcode).toBe('012345678901');
    expect(postRes.body.productName).toBe('Grilled Chicken Breast');

    const getRes = await request(app)
      .get('/api/scan/history')
      .set('Authorization', authHeader());
    expect(getRes.status).toBe(200);
    expect(getRes.body.length).toBe(1);
    expect(getRes.body.productName || getRes.body[0].productName).toBe('Grilled Chicken Breast');
  });

  it('GET /api/scan/lookup/:barcode returns 404 for unknown barcode', async () => {
    const res = await request(app)
      .get('/api/scan/lookup/999999999999')
      .set('Authorization', authHeader());
    expect(res.status).toBe(404);
  });
});
