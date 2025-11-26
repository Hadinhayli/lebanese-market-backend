import { Request, Response } from 'express';
import * as orderService from '../services/order.service.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../utils/order.validation.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Validate input
    const validatedData = createOrderSchema.parse(req.body);

    const order = await orderService.createOrder(userId, validatedData);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('Order validation error:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('Order creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Clean up query parameters
    const cleanedQuery: any = {};
    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        cleanedQuery[key] = value;
      }
    });

    // Validate query parameters
    const validatedQuery = orderQuerySchema.parse(cleanedQuery);

    const result = await orderService.getUserOrders(userId, validatedQuery);

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
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
      message: error.message || 'Failed to fetch orders',
    });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Clean up query parameters
    const cleanedQuery: any = {};
    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        cleanedQuery[key] = value;
      }
    });

    // Validate query parameters
    const validatedQuery = orderQuerySchema.parse(cleanedQuery);

    const result = await orderService.getAllOrders(validatedQuery);

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
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
      message: error.message || 'Failed to fetch orders',
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.isAdmin;

    // Users can only view their own orders unless they're admin
    const order = await orderService.getOrderById(id, isAdmin ? undefined : userId);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order',
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate input
    const validatedData = updateOrderStatusSchema.parse(req.body);

    const order = await orderService.updateOrderStatus(id, validatedData);

    res.status(200).json({
      success: true,
      data: order,
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
      message: error.message || 'Failed to update order status',
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await orderService.deleteOrder(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete order',
    });
  }
};

