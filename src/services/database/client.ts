import type { PoolClient } from 'pg';
import { Pool } from 'pg';

const { POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;

const pool = new Pool({
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  host: POSTGRES_HOST,
});

pool.on('error', e => {
  console.error('Unexpected error on idle client', e);
  process.exit(-1);
});

const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  return client;
};

// Useful for gracefully shutting down your app
const closePool = (): void => {
  pool.end();
};

export { getClient, closePool };
