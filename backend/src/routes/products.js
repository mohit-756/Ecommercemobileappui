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
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // limit to 5MB
});
const router = Router();

router.get('/', getProducts);
router.get('/search-suggestions', getSearchSuggestions);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, createProduct);
router.post('/bulk-upload', protect, adminOnly, upload.single('file'), bulkUploadProducts);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
