import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { generateOtp, sendOtpEmail } from '../services/emailService.js';
import { startVerifyVerification, checkVerifyVerification } from '../services/smsService.js';

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
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or Phone is required' });
    }



    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format. Must be exactly 10 digits.' });
      }
      const formattedPhone = `+91${phone}`;
      await startVerifyVerification(formattedPhone);

      return res.json({ success: true, message: 'OTP sent successfully' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const otp = generateOtp();
    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const emailResult = await sendOtpEmail(email, otp);

    if (emailResult.messageId === 'dev-mode') {
      const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      return res.json({ 
        message: 'OTP sent to your email', 
        ...(isDev && { otp, dev: true }) 
      });
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, phone, otp, name, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or Phone is required' });
    }
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format. Must be exactly 10 digits.' });
      }
      const formattedPhone = `+91${phone}`;
      const check = await checkVerifyVerification(formattedPhone, otp);

      if (check.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      let user = await User.findOne({ phone: formattedPhone });
      if (!user) {
        // Automatically create account
        const dummyEmail = `${formattedPhone}@phone.dryfruithub.local`;
        const dummyPassword = crypto.randomBytes(16).toString('hex');
        
        user = await User.create({
          name: `User ${formattedPhone.slice(-4)}`,
          email: dummyEmail,
          password: dummyPassword,
          phone: formattedPhone,
        });
      }

      const token = generateToken(user._id);
      return res.json({ success: true, token, user });
    }

    // Keep email OTP verification logic
    const query = { email, verified: false };
    const otpRecord = await Otp.findOne(query);
    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found. Request a new one.' });
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteMany(query);
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
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Google ID Token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account does not have an email' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        avatar: picture || '',
      });
    } else if (picture && !user.avatar) {
      user.avatar = picture;
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    console.error('Google verification error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
}
