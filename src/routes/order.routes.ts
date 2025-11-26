import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// User routes (require authentication)
router.post('/', authenticate, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getUserOrders);
router.get('/:id', authenticate, orderController.getOrderById);

// Admin routes (require authentication and admin role)
router.get('/', authenticate, requireAdmin, orderController.getAllOrders);
router.patch('/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);
router.delete('/:id', authenticate, requireAdmin, orderController.deleteOrder);

export default router;


