import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { generateOtp, sendOtpEmail, hasTransporter } from '../services/emailService.js';

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const otpRecord = await Otp.findOne({ email, verified: true });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Email not verified. Please verify OTP first.' });
    }

    const user = await User.create({ name, email, password, phone });
    await Otp.deleteMany({ email });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
}

export async function sendOtp(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    await Otp.deleteMany({ email });

    const otp = generateOtp();
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Check if a transporter config exists
    if (!hasTransporter()) {
      // In dev fallback mode, print to console and return OTP in response instantly
      console.log('========================================');
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
      console.log('========================================');
      return res.json({ message: 'OTP sent to your email', otp, dev: true });
    }

    // In production mode, send the email asynchronously in the background.
    // This allows responding to the client immediately (~10-20ms) instead of waiting for SMTP delivery (~2000-5000ms).
    sendOtpEmail(email, otp).catch((error) => {
      console.error(`Background email sending failed for ${email}:`, error);
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, otp, name, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await Otp.findOne({ email, verified: false });
    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found. Request a new one.' });
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    if (name && password) {
      const user = await User.create({ name, email, password });
      await Otp.deleteMany({ email });
      const token = generateToken(user._id);
      return res.status(201).json({ token, user });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
}
