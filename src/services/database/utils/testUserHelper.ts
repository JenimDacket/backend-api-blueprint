import { User } from '../../../models/User';
import { createUser, getUser } from '../queries/users';

export const testUserId = 1;

export const createTestUser = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot create test user in production');
  }

  const user = await getUser(testUserId);
  if (!user) {
    const user = await createUser({
      name: 'John Doe',
      oauthId: ""
    } as User);

    console.log(`Created test user with id: ${user.id}`);
  }
};
