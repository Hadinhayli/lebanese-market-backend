import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', reviewController.getReviews);
router.get('/:id', reviewController.getReviewById);

// Protected routes (require authentication)
router.post('/', authenticate, reviewController.createReview);
router.patch('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

export default router;


