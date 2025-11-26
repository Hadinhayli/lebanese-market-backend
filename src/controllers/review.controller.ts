import { Request, Response } from 'express';
import * as reviewService from '../services/review.service.js';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
} from '../utils/review.validation.js';

export const getReviews = async (req: Request, res: Response) => {
  try {
    // Clean up query parameters
    const cleanedQuery: any = {};
    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        cleanedQuery[key] = value;
      }
    });

    // Validate query parameters
    const validatedQuery = reviewQuerySchema.parse(cleanedQuery);

    const result = await reviewService.getReviews(validatedQuery);

    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('Review query validation error:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch reviews',
    });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await reviewService.getReviewById(id);

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    if (error.message === 'Review not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch review',
    });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Validate input
    const validatedData = createReviewSchema.parse(req.body);

    const review = await reviewService.createReview(userId, validatedData);

    res.status(201).json({
      success: true,
      data: review,
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
      message: error.message || 'Failed to create review',
    });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Validate input
    const validatedData = updateReviewSchema.parse(req.body);

    const review = await reviewService.updateReview(id, userId, validatedData);

    res.status(200).json({
      success: true,
      data: review,
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
      message: error.message || 'Failed to update review',
    });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.isAdmin || false;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const result = await reviewService.deleteReview(id, userId, isAdmin);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'Review not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete review',
    });
  }
};


