// TODO: edit user type once we get auth working
export type User = {
  id: number;
  /**
   * @minLength 1
   * @maxLength 200
   */
  name?: string;
  /**
   * @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
   */
  oauthId: string;
};
