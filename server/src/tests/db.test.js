import { describe, it, expect } from 'vitest';
import pool from '../db/pool';

describe('Database Connection', () => {
  it('should connect to the test database', async () => {
    const result = await pool.query('SELECT 1');
    expect(result.rows[0]['?column?']).toBe(1);
  });
});
