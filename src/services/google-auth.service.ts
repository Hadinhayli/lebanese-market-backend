import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';

// Create OAuth2Client lazily to ensure environment variables are loaded
const getClient = (): OAuth2Client => {
  // Use process.env directly to ensure we get the latest values (important for Vercel)
  const clientId = process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || env.GOOGLE_REDIRECT_URI;
  
  console.log('Creating OAuth2Client with:', {
    clientId: clientId ? `${clientId.substring(0, 20)}...` : 'MISSING',
    clientSecret: clientSecret ? 'Set (hidden)' : 'MISSING',
    redirectUri,
  });
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.');
  }
  
  return new OAuth2Client(clientId, clientSecret, redirectUri);
};

export const getGoogleAuthUrl = () => {
  const client = getClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });
};

export const verifyGoogleToken = async (code: string) => {
  try {
    // Get fresh client instance with current environment variables
    const client = getClient();
    
    // Use process.env directly to ensure we get the latest values
    const clientId = process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || env.GOOGLE_REDIRECT_URI;
    
    console.log('Exchanging authorization code for tokens...');
    console.log('Using redirect_uri:', redirectUri);
    console.log('Client ID:', clientId ? `${clientId.substring(0, 20)}...` : 'MISSING');
    console.log('Client Secret:', (process.env.GOOGLE_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET) ? 'Set (hidden)' : 'MISSING');
    
    const { tokens } = await client.getToken(code);
    
    if (!tokens.id_token) {
      throw new Error('No ID token received from Google');
    }
    
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
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
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || env.GOOGLE_REDIRECT_URI;
      throw new Error(`Redirect URI mismatch. Expected: ${redirectUri}. Please verify this matches your Google Cloud Console settings.`);
    }
    
    throw error;
  }
};

