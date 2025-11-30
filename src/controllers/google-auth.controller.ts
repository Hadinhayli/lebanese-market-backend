import { Request, Response } from 'express';
import * as googleAuthService from '../services/google-auth.service.js';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.util.js';
import { env } from '../config/env.js';
import bcrypt from 'bcryptjs';

export const getGoogleAuthUrl = async (req: Request, res: Response) => {
  try {
    const authUrl = googleAuthService.getGoogleAuthUrl();
    res.json({ 
      success: true, 
      data: { authUrl } 
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate Google auth URL',
    });
  }
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }

    // Verify Google token and get user info
    const googleUser = await googleAuthService.verifyGoogleToken(code);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (!user) {
      // Create new user with a random password (OAuth users won't use password)
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email.toLowerCase(),
          password: hashedPassword, // Random password for OAuth users
          emailVerified: true, // Google emails are verified
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:8080';
    res.redirect(`${frontendUrl}/auth/google/callback?token=${token}`);
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:8080';
    res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
  }
};

