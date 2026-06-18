import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
  getSearchSuggestions,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { adminAuditLog } from '../middleware/adminAudit.js';
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // limit to 5MB
});
const router = Router();

router.get('/', getProducts);
router.get('/search-suggestions', getSearchSuggestions);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, adminAuditLog, createProduct);
router.post('/bulk-upload', protect, adminOnly, adminAuditLog, upload.single('file'), bulkUploadProducts);
router.put('/:id', protect, adminOnly, adminAuditLog, updateProduct);
router.delete('/:id', protect, adminOnly, adminAuditLog, deleteProduct);

export default router;
