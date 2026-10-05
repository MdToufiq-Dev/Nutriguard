import { PostgresInstance, PsqlTool } from 'pg-embedded';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '.pgdata-test');

// Clean up previous run if any
if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true, force: true });
}

const pg = new PostgresInstance({
  dataDir: dataDir,
  port: 5433,
});

async function run() {
  await pg.start();

  // Create test DB using PsqlTool
  const psql = new PsqlTool({ connection: await pg.getConnection() });
  await psql.executeCommand('CREATE DATABASE nutriguard_test');

  process.env.DATABASE_URL = 'postgres://postgres@localhost:5433/nutriguard';
  process.env.TEST_DATABASE_URL = 'postgres://postgres@localhost:5433/nutriguard_test';
  process.env.NODE_ENV = 'test';

  const { execSync } = await import('child_process');
  try {
    execSync('npm run migrate:up', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL } });
    execSync('vitest run', { stdio: 'inherit' });
  } finally {
    await pg.stop();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
}

run().catch(console.error);
