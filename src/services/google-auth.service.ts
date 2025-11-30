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
  try {
    // Validate credentials are set
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials are not configured. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.');
    }
    
    console.log('Exchanging authorization code for tokens...');
    console.log('Using redirect_uri:', env.GOOGLE_REDIRECT_URI);
    console.log('Client ID:', env.GOOGLE_CLIENT_ID ? `${env.GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'MISSING');
    console.log('Client Secret:', env.GOOGLE_CLIENT_SECRET ? 'Set (hidden)' : 'MISSING');
    
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
  } catch (error: any) {
    console.error('Error in verifyGoogleToken:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });
    
    // Provide more specific error messages
    if (error.message?.includes('invalid_client')) {
      throw new Error('Invalid Google OAuth client credentials. Please verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.');
    }
    if (error.message?.includes('redirect_uri_mismatch')) {
      throw new Error(`Redirect URI mismatch. Expected: ${env.GOOGLE_REDIRECT_URI}. Please verify this matches your Google Cloud Console settings.`);
    }
    
    throw error;
  }
};

