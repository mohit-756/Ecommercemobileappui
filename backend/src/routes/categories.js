import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { adminAuditLog } from '../middleware/adminAudit.js';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, adminOnly, adminAuditLog, createCategory);
router.put('/:id', protect, adminOnly, adminAuditLog, updateCategory);
router.delete('/:id', protect, adminOnly, adminAuditLog, deleteCategory);

export default router;
