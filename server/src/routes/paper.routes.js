import express from 'express';
import * as paperController from '../controllers/paper.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', paperController.getPapers);
router.get('/my-papers', protect, paperController.getMyPapers);
router.get('/filters', paperController.getFilters);
router.get('/stats', paperController.getStats);

export default router;