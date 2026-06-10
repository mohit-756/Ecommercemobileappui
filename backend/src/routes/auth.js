import { Router } from 'express';
import { register, login, getProfile, updateProfile, sendOtp, verifyOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
