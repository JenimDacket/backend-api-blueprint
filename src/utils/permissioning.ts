import { PermissionError } from '../errors/PermissionError';

export const throwIfInvalidPermissions = (
  req: Express.Request,
  userIdToCheck: string | null | undefined,
) => {
  if (req.auth?.payload.sub !== userIdToCheck) throw new PermissionError('Denied.');
};

export const getUserIdFromRequest = (req: Express.Request): string => {
  if (!req.auth?.payload?.sub) throw new PermissionError('Denied');
  return req.auth.payload.sub;
};
