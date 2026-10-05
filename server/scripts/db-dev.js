import { PostgresInstance, PsqlTool } from 'pg-embedded';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '.pgdata');

const pg = new PostgresInstance({
  dataDir: dataDir,
  port: 5432,
});

async function run() {
  await pg.start();

  // Create test DB using PsqlTool
  const psql = new PsqlTool({ instance: pg });
  try {
      await psql.exec('CREATE DATABASE nutriguard');
  } catch(e) {
      // Ignore if exists
  }

  console.log('Database started. DATABASE_URL=postgres://postgres@localhost:5432/nutriguard');
  console.log('Keep this process running. Press Ctrl+C to stop.');

  // Keep alive
  await new Promise(() => {});
}

run().catch(console.error);
