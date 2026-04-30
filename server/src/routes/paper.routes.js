import express from 'express';
import * as paperController from '../controllers/paper.controller.js';

const router = express.Router();

router.get('/', paperController.getPapers);
router.get('/filters', paperController.getFilters);
router.get('/stats', paperController.getStats);

export default router;