import { Router } from 'express';
import { checkPincode, calculateShipping } from '../controllers/shippingController.js';

const router = Router();

router.get('/pincode/:pincode', checkPincode);
router.post('/calculate', calculateShipping);

export default router;
