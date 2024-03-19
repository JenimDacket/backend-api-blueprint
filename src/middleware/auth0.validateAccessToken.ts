import { auth } from 'express-oauth2-jwt-bearer';

export const validateAccessToken = () => {
  return auth({
    issuerBaseURL: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
    tokenSigningAlg: 'RS256',
    authRequired: true,
  });
};
