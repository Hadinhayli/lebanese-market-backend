import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  price: z.number().positive('Price must be positive').min(0.01, 'Price must be at least 0.01'),
  image: z.string().url('Image must be a valid URL').or(z.string().min(1, 'Image is required')),
  categoryId: z.string().uuid('Category ID must be a valid UUID'),
  subcategoryId: z.string().uuid('Subcategory ID must be a valid UUID'),
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative').default(0),
  rating: z.number().min(0, 'Rating must be at least 0').max(5, 'Rating must be at most 5').default(0).optional(),
  reviewCount: z.number().int('Review count must be an integer').min(0, 'Review count cannot be negative').default(0).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  categoryId: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  subcategoryId: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  minPrice: z.coerce.number().positive().optional().or(z.literal('').transform(() => undefined)),
  maxPrice: z.coerce.number().positive().optional().or(z.literal('').transform(() => undefined)),
  search: z.string().optional().or(z.literal('').transform(() => undefined)),
  sortBy: z.enum(['price', 'rating', 'name', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;

