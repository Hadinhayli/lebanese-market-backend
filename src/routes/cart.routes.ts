import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCartItems);
router.post('/', cartController.addToCart);
router.patch('/:productId', cartController.updateCartItem);
router.delete('/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;


