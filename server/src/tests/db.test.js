import { describe, it, expect } from 'vitest';
import pool from '../db/pool';
import config from '../config/env.js';

if (config.authMode !== 'jwt') {
  throw new Error('Backend tests require AUTH_MODE=jwt');
}

describe('Database Connection', () => {
  it('should connect to the test database', async () => {
    const result = await pool.query('SELECT 1');
    expect(result.rows[0]['?column?']).toBe(1);
  });
});
