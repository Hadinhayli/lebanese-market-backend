import { Router } from 'express';
import { uploadSingle, uploadImage, handleUploadError } from '../controllers/upload.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Upload route (admin only)
router.post('/', authenticate, requireAdmin, uploadSingle, handleUploadError, uploadImage);

export default router;

