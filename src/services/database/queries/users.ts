import { User } from '../../../models/User';
import { getClient } from '../client';

const createUser = async (user: User): Promise<User> => {
  const Client = await getClient();
  const query = `
          INSERT INTO users
              (name, oauth_id)
          VALUES
              ($1, $2)
          RETURNING id
      `;

  console.log(user);
  try {
    await Client.query(query, [
      user.name,
      user.oauthId
    ]);

    return user;
  } finally {
    Client.release();
  }
};

export const updateUser = async (user: User): Promise<User> => {
  const Client = await getClient();
  const query = `
          UPDATE users
          SET name = $2,
              oauth_id = $3,
          WHERE id = $1
      `;

  try {
    await Client.query(query, [
      user.id, // Assuming `user.id` is the unique identifier
      user.name,
      user.oauthId,
    ]);

    return user;
  } finally {
    Client.release();
  }
};

const getUser = async (id: number): Promise<User | undefined> => {
  const Client = await getClient();
  const query = `
      SELECT id, name, oauth_id
      FROM users
      WHERE id = $1;
      `;

  try {
    const { rows } = await Client.query(query, [id]);
    if (rows.length === 0) {
      return undefined;
    }
    const row = rows[0];
    return {
      id: row.id,
      name: row.name ?? '',
      oauthId: row.oauth_id,
    } as User;
  } catch (e) {
    console.error('', e);
    throw new Error('Failed to retrieve User');
  } finally {
    Client.release();
  }
};

export { createUser, getUser };
