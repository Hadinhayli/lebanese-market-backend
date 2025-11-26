import { Request, Response } from 'express';
import * as productService from '../services/product.service.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../utils/product.validation.js';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Clean up query parameters - remove empty strings
    const cleanedQuery: any = {};
    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        cleanedQuery[key] = value;
      }
    });

    // Validate query parameters
    const validatedQuery = productQuerySchema.parse(cleanedQuery);

    const result = await productService.getAllProducts(validatedQuery);

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('Validation error:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(id);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product',
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = createProductSchema.parse(req.body);

    const product = await productService.createProduct(validatedData);

    res.status(201).json({
      success: true,
      data: product,
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
      message: error.message || 'Failed to create product',
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate input
    const validatedData = updateProductSchema.parse(req.body);

    const product = await productService.updateProduct(id, validatedData);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await productService.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product',
    });
  }
};

