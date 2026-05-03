import express from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/insights', protect, aiController.getAIInsights);
router.post('/chat', protect, aiController.chat);

export default router;
