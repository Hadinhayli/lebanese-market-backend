import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export const generateToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
};

export const generateRefreshToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateResetToken = (): string => {
  const options: SignOptions = {
    expiresIn: '1h', // Password reset tokens expire in 1 hour
  };
  return jwt.sign({ type: 'reset' }, env.JWT_SECRET, options);
};

export const verifyResetToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { type?: string };
    return decoded.type === 'reset';
  } catch (error) {
    return false;
  }
};

