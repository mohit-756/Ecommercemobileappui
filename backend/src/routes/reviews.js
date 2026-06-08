import { Router } from 'express';
import { getProductReviews, createReview, checkUserReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/check', protect, checkUserReview);
router.post('/product/:productId', protect, createReview);

export default router;
