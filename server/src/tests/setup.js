import { execSync } from 'child_process';
import { beforeAll, afterAll } from 'vitest';
import pool from '../db/pool';

beforeAll(async () => {
  console.log('Running migrations for test database...');
  try {
    // Assuming we are in server/ directory or running from it
    execSync('npm run migrate:up', { stdio: 'inherit' });
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  await pool.end();
});

// Helper to truncate tables to ensure test isolation
export async function truncateDatabase() {
  const tables = await pool.query(`
    SELECT tablename
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public'
  `);

  for (const row of tables.rows) {
    const tableName = row.tablename;
    if (tableName !== 'migrations') {
        await pool.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
    }
  }
}
