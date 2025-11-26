import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  rating: z.number().int('Rating must be an integer').min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  text: z.string().min(10, 'Review text must be at least 10 characters').max(2000, 'Review text must be less than 2000 characters').optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int('Rating must be an integer').min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  text: z.string().min(10, 'Review text must be at least 10 characters').max(2000, 'Review text must be less than 2000 characters').optional(),
});

export const reviewQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  sortBy: z.enum(['createdAt', 'rating']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;


