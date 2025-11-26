import { Request, Response } from 'express';
import * as categoryService from '../services/category.service.js';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
});

const createSubcategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
});

const updateCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
});

const updateSubcategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
});

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories',
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch category',
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);

    const category = await categoryService.createCategory(validatedData.name);

    res.status(201).json({
      success: true,
      data: category,
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
      message: error.message || 'Failed to create category',
    });
  }
};

export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const validatedData = createSubcategorySchema.parse(req.body);

    const subcategory = await categoryService.createSubcategory(categoryId, validatedData.name);

    res.status(201).json({
      success: true,
      data: subcategory,
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
      message: error.message || 'Failed to create subcategory',
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);

    const category = await categoryService.updateCategory(id, validatedData.name);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update category',
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await categoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete category',
    });
  }
};

export const updateSubcategory = async (req: Request, res: Response) => {
  try {
    const { categoryId, id } = req.params;
    const validatedData = updateSubcategorySchema.parse(req.body);

    const subcategory = await categoryService.updateSubcategory(id, validatedData.name);

    res.status(200).json({
      success: true,
      data: subcategory,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error.message === 'Subcategory not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update subcategory',
    });
  }
};

export const deleteSubcategory = async (req: Request, res: Response) => {
  try {
    const { categoryId, id } = req.params;

    const result = await categoryService.deleteSubcategory(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'Subcategory not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete subcategory',
    });
  }
};

