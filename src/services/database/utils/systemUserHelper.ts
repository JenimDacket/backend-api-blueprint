import { createUser, getUser } from '../queries/users';


export const createSystemUser = async (): Promise<void> => {
  const user = await getUser(0);
  if (!user || user.name != "system") {
    const id = await createUser({
      id: 0,
      name: 'System',
      oauthId: '',
    });

    console.log(`Created system user with id: ${id}`);
  }
};
