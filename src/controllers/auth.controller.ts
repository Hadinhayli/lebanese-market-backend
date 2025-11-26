import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validation.util.js';

export const signUp = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(req.body);

    // Create user
    const result = await authService.signUp(validatedData);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create account',
    });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = signInSchema.parse(req.body);

    // Authenticate user
    const result = await authService.signIn(validatedData);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials',
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = forgotPasswordSchema.parse(req.body);

    // Send password reset email
    const result = await authService.forgotPassword(validatedData);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process password reset request',
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = resetPasswordSchema.parse(req.body);

    // Reset password
    const result = await authService.resetPassword(validatedData);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reset password',
    });
  }
};





