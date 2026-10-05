import { Client } from 'pg';
import { config } from 'dotenv';
config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString: url });
  await client.connect();
  const res = await client.query('SELECT version()');
  console.log('Postgres version:', res.rows[0].version);

  const tables = await client.query(`
    SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
  `);
  console.log('Tables:', tables.rows.map(r => r.tablename));

  await client.end();
}

run().catch(console.error);
