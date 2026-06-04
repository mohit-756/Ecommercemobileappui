import { Router } from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/stats', protect, adminOnly, getDashboardStats);

export default router;
