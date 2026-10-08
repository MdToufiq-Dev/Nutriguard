import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import pool from '../db/pool.js';
import config from '../config/env.js';
import { ComplianceModel } from '../db/models/compliance.js';

describe('Calendar & Compliance API', () => {
  const userId = config.devUserId;

  beforeEach(async () => {
    await pool.query('DELETE FROM compliance WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM plan_meals');
    await pool.query('DELETE FROM plans WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_constraints WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1 OR email = $2', [userId, 'dev@example.com']);
    await pool.query(
      'INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email',
      [userId, 'dev@example.com']
    );
  });

  it('should set and get compliance for a specific date', async () => {
    const postRes = await request(app)
      .post('/api/calendar/compliance')
      .send({
        date: '2026-10-04',
        status: 'followed'
      });

    expect(postRes.status).toBe(201);
    expect(postRes.body.status).toBe('followed');
    expect(postRes.body.date).toBe('2026-10-04');

    const getRes = await request(app).get('/api/calendar/compliance/2026-10-04');
    expect(getRes.status).toBe(200);
    expect(getRes.body.status).toBe('followed');
  });

  it('should update existing compliance if called again on same date', async () => {
    await request(app)
      .post('/api/calendar/compliance')
      .send({ date: '2026-10-04', status: 'partial' });

    const updateRes = await request(app)
      .post('/api/calendar/compliance')
      .send({ date: '2026-10-04', status: 'followed' });

    expect(updateRes.status).toBe(201);
    expect(updateRes.body.status).toBe('followed');

    const logRes = await request(app).get('/api/calendar/compliance');
    expect(logRes.body.logs.length).toBe(1);
    expect(logRes.body.logs[0].status).toBe('followed');
  });

  it('should delete a compliance entry', async () => {
    await request(app)
      .post('/api/calendar/compliance')
      .send({ date: '2026-10-03', status: 'followed' });

    const deleteRes = await request(app).delete('/api/calendar/compliance/2026-10-03');
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get('/api/calendar/compliance/2026-10-03');
    expect(getRes.status).toBe(404);
  });

  it('should calculate streak accurately for consecutive days', () => {
    const today = new Date('2026-10-08T00:00:00Z');
    vi.setSystemTime(today);

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const d0 = new Date(today);
    const d1 = new Date(today);
    d1.setDate(d1.getDate() - 1);
    const d2 = new Date(today);
    d2.setDate(d2.getDate() - 2);
    const d3 = new Date(today);
    d3.setDate(d3.getDate() - 3);

    const logs = [
      { date: formatDate(d0), status: 'followed' },
      { date: formatDate(d1), status: 'followed' },
      { date: formatDate(d2), status: 'followed' },
      { date: formatDate(d3), status: 'missed' },
    ];

    const streak = ComplianceModel.calculateStreak(logs);
    expect(streak).toBe(3);

    vi.useRealTimers();
  });
});
