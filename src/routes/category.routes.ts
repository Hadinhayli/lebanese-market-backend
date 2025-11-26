import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes (admin only)
router.post('/', authenticate, requireAdmin, categoryController.createCategory);
router.patch('/:id', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);
router.post('/:categoryId/subcategories', authenticate, requireAdmin, categoryController.createSubcategory);
router.patch('/:categoryId/subcategories/:id', authenticate, requireAdmin, categoryController.updateSubcategory);
router.delete('/:categoryId/subcategories/:id', authenticate, requireAdmin, categoryController.deleteSubcategory);

export default router;

