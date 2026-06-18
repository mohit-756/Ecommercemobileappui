import { Router } from 'express';
import { getDashboardStats, getAllUsers } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { adminAuditLog } from '../middleware/adminAudit.js';

const router = Router();

// Apply audit logging to all admin routes
router.use(protect, adminOnly, adminAuditLog);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);

export default router;
