import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid('Product ID must be a valid UUID'),
    quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
  })).min(1, 'Order must have at least one item'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500, 'Address must be less than 500 characters'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 characters').max(20, 'Phone number must be less than 20 characters'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED' })
  }).optional(),
  trackingNumber: z.string().min(1, 'Tracking number cannot be empty').max(100, 'Tracking number is too long').optional(),
});

export const orderQuerySchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;

