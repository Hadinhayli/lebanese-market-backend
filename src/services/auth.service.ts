import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken, generateResetToken, verifyResetToken } from '../utils/jwt.util.js';
import { sendPasswordResetEmail, sendPasswordResetEmailDev } from './email.service.js';
import { env } from '../config/env.js';
import type { SignUpInput, SignInInput, ForgotPasswordInput, ResetPasswordInput } from '../types/index.js';

export const signUp = async (input: SignUpInput) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      isAdmin: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user as any);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    token,
  };
};

export const signIn = async (input: SignInInput) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    token,
  };
};

export const forgotPassword = async (input: ForgotPasswordInput) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  // Don't reveal if user exists or not (security best practice)
  if (!user) {
    // Still return success to prevent email enumeration
    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  // Save reset token to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry,
    },
  });

  // Send email
  // Check if email is properly configured (not just placeholder values)
  const isEmailConfigured = env.EMAIL_HOST && 
                             env.EMAIL_USER && 
                             env.EMAIL_USER !== 'your-email@gmail.com' &&
                             env.EMAIL_PASS &&
                             env.EMAIL_PASS !== 'your-app-password';
  
  if (!isEmailConfigured) {
    // Development mode without email setup - log to console
    await sendPasswordResetEmailDev(user.email, resetToken);
  } else {
    // Production mode with email configured
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      // Remove the reset token if email fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      throw new Error('Failed to send password reset email. Please try again later.');
    }
  }

  return { message: 'If an account exists with this email, a password reset link has been sent.' };
};

export const resetPassword = async (input: ResetPasswordInput) => {
  // Verify token
  if (!verifyResetToken(input.token)) {
    throw new Error('Invalid or expired reset token');
  }

  // Find user with this reset token
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: input.token,
      resetPasswordExpires: {
        gt: new Date(), // Token must not be expired
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(input.password, 12);

  // Update user password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { message: 'Password has been reset successfully' };
};

