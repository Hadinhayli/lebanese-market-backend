import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';

// Validate Google OAuth credentials
if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
  console.error('Google OAuth credentials are missing!');
  console.error('GOOGLE_CLIENT_ID:', env.GOOGLE_CLIENT_ID ? 'Set' : 'MISSING');
  console.error('GOOGLE_CLIENT_SECRET:', env.GOOGLE_CLIENT_SECRET ? 'Set' : 'MISSING');
}

const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export const getGoogleAuthUrl = () => {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });
};

export const verifyGoogleToken = async (code: string) => {
  const { tokens } = await client.getToken(code);
  
  if (!tokens.id_token) {
    throw new Error('No ID token received from Google');
  }
  
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid token payload');
  }
  
  return {
    email: payload.email!,
    name: payload.name!,
    picture: payload.picture,
    googleId: payload.sub,
  };
};

