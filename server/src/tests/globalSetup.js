import { Client } from 'pg';
import { config } from 'dotenv';
import { execSync } from 'child_process';

config();

export async function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !url.endsWith('_test')) {
    console.error('ERROR: TEST_DATABASE_URL must end with _test to protect dev data');
    process.exit(1);
  }

  // Apply migrations
  console.log('Running migrations...');
  execSync('npx node-pg-migrate --migrations-dir src/db/migrations up', {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: url }
  });
  console.log('Migrations complete.');
}

export async function teardown() {
  const url = process.env.TEST_DATABASE_URL;
  const client = new Client({ connectionString: url });
  await client.connect();

  // Truncate tables
  console.log('Cleaning test database...');
  const res = await client.query(`
    SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
  `);
  for (const row of res.rows) {
    if (row.tablename !== 'migrations' && row.tablename !== 'pgmigrations') {
      await client.query(`TRUNCATE TABLE "${row.tablename}" RESTART IDENTITY CASCADE`);
    }
  }
  await client.end();
  console.log('Test database cleaned.');
}
