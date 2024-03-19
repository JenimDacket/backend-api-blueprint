import { getClient } from './client';
import { initResultHandler } from './utils/initResultHandler';

const initSchema = async (): Promise<void> => {
  const client = await getClient();

  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS examples (
        id BIG SERIAL PRIMARY KEY,
        name TEXT,
        type TEXT,
        created_by BIGINT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    );`,
      initResultHandler,
    );

    await client.query(
      `CREATE TABLE IF NOT EXISTS users (
        id BIG SERIAL PRIMARY KEY,
        name TEXT,
        oauth_id TEXT,
      )`
    )

    // Indices -- review if there are more that should be considered
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_examples_type ON examples(type);',
    );
  } catch (e) {
    console.error('\x1b[31m', 'Failed to initialize db schema: ', e);
    throw e;
  } finally {
    client.release();
  }
};

export default initSchema;
