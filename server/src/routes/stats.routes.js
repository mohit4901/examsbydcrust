import express from 'express';
import { getTotalUsers } from '../controllers/stats.controller.js';

const router = express.Router();

router.get('/users', getTotalUsers);

export default router;
