import { Request, Response } from 'express';
import * as userService from '../services/user.service.js';
import {
  updateUserSchema,
  userQuerySchema,
} from '../utils/user.validation.js';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../utils/profile.validation.js';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Clean up query parameters
    const cleanedQuery: any = {};
    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        cleanedQuery[key] = value;
      }
    });

    // Validate query parameters
    const validatedQuery = userQuerySchema.parse(cleanedQuery);

    const result = await userService.getAllUsers(validatedQuery);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('User query validation error:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user',
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate input
    const validatedData = updateUserSchema.parse(req.body);

    const user = await userService.updateUser(id, validatedData);

    res.status(200).json({
      success: true,
      data: user,
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
      message: error.message || 'Failed to update user',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user?.id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const result = await userService.deleteUser(id, currentUserId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await userService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile',
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const user = await userService.updateProfile(userId, validatedData);

    res.status(200).json({
      success: true,
      data: user,
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
      message: error.message || 'Failed to update profile',
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const validatedData = changePasswordSchema.parse(req.body);
    const result = await userService.changePassword(
      userId,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('Password change validation error:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('Password change error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to change password',
    });
  }
};

