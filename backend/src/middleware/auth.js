import jwt from 'jsonwebtoken';
import User from '../models/User.js';

async function getGuestUser() {
  let guest = await User.findOne({ email: 'guest@luminar.app' });
  if (!guest) {
    guest = await User.create({
      name: 'Guest User',
      email: 'guest@luminar.app',
      password: 'guest0000',
      role: 'user',
      phone: '0000000000',
    });
  }
  return guest;
}

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      req.user = await getGuestUser();
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      req.user = await getGuestUser();
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    req.user = await getGuestUser();
    next();
  }
}

export function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
}
