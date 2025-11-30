import { Router } from 'express';
import * as googleAuthController from '../controllers/google-auth.controller.js';

const router = Router();

router.get('/url', googleAuthController.getGoogleAuthUrl);
router.get('/callback', googleAuthController.handleGoogleCallback);

export default router;

