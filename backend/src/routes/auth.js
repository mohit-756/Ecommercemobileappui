import { Router } from 'express';
import { register, login, googleLogin, getProfile, updateProfile, sendOtp, verifyOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { otpRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/send-otp', otpRateLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
