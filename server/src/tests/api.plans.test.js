import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import pool from '../db/pool.js';
import config from '../config/env.js';

describe('Plans & Constraints API', () => {
  const testUserId = config.devUserId;

  beforeEach(async () => {
    await pool.query(
      'INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email',
      [testUserId, 'dev@example.com']
    );
  });

  it('POST /api/plans/constraints and GET /api/plans/constraints', async () => {
    const constraintData = {
      goal: 'muscle-gain',
      diet_type: 'high-protein',
      daily_budget: 25.50,
      calorie_target: 2800,
      meal_timings: { breakfast: '07:30', lunch: '12:30', dinner: '19:30' },
    };

    const postRes = await request(app)
      .post('/api/plans/constraints')
      .send(constraintData);

    expect(postRes.status).toBe(201);
    expect(postRes.body.goal).toBe('muscle-gain');

    const getRes = await request(app).get('/api/plans/constraints');
    expect(getRes.status).toBe(200);
    expect(getRes.body.goal).toBe('muscle-gain');
    expect(Number(getRes.body.daily_budget)).toBe(25.50);
  });

  it('POST /api/plans and GET /api/plans/active', async () => {
    const planData = {
      id: 'plan-api-1',
      goal: 'muscle-gain',
      diet_type: 'high-protein',
      duration: 14,
      daily_budget: 25.50,
      calorie_target: 2800,
      start_date: '2026-10-01',
      end_date: '2026-10-15',
    };

    const postRes = await request(app)
      .post('/api/plans')
      .send(planData);

    expect(postRes.status).toBe(201);
    expect(postRes.body.id).toBe('plan-api-1');

    const getRes = await request(app).get('/api/plans/active');
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe('plan-api-1');
  });

  it('GET /api/users/:userId/constraints and PUT /api/users/:userId/constraints', async () => {
    const customUserId = 'custom-user-123';
    await pool.query(
      'INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email',
      [customUserId, 'custom@example.com']
    );

    const updateRes = await request(app)
      .put(`/api/users/${customUserId}/constraints`)
      .send({
        goal: 'keto',
        diet_type: 'keto',
        daily_budget: 30.00,
        calorie_target: 1900,
        meal_timings: { lunch: '12:00', dinner: '18:00' },
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.goal).toBe('keto');

    const getRes = await request(app).get(`/api/users/${customUserId}/constraints`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.goal).toBe('keto');
  });
});
