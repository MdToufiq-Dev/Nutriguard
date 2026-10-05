import pg from 'pg';
import config from '../config/env.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

// Determine which DB URL to use based on environment
const databaseUrl = config.nodeEnv === 'test'
  ? config.testDatabaseUrl
  : config.databaseUrl;

if (!databaseUrl) {
  logger.error('Database URL not found in configuration');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
