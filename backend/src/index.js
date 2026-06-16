import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import addressRoutes from './routes/addresses.js';
import shippingRoutes from './routes/shipping.js';
import adminRoutes from './routes/admin.js';
import geocodingRoutes from './routes/geocoding.js';
import wishlistRoutes from './routes/wishlist.js';
import reviewRoutes from './routes/reviews.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateTwilioConfig } from './services/smsService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
}));
app.use(express.json());

// Request logging middleware to diagnose performance/endpoints
import fs from 'fs';
app.use((req, res, next) => {
  const start = Date.now();
  const logFile = path.join(__dirname, '../requests.log');
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.url} started\n`;
  try {
    fs.appendFileSync(logFile, logMsg);
  } catch (e) {}
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const finishMsg = `[${new Date().toISOString()}] ${req.method} ${req.url} finished in ${duration}ms with status ${res.statusCode}\n`;
    try {
      fs.appendFileSync(logFile, finishMsg);
    } catch (e) {}
  });
  next();
});

app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/geocode', geocodingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(errorHandler);

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

async function start() {
  console.log('Starting server...');
  console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
  console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
  console.log('GMAIL_USER set:', !!process.env.GMAIL_USER);
  console.log('GMAIL_APP_PASSWORD set:', !!process.env.GMAIL_APP_PASSWORD);
  console.log('TWILIO_ACCOUNT_SID set:', !!process.env.TWILIO_ACCOUNT_SID);
  console.log('TWILIO_API_KEY set:', !!process.env.TWILIO_API_KEY);
  console.log('TWILIO_API_SECRET set:', !!process.env.TWILIO_API_SECRET);
  console.log('TWILIO_VERIFY_SERVICE_SID set:', !!process.env.TWILIO_VERIFY_SERVICE_SID);
  console.log('PORT:', process.env.PORT || PORT);
  try {
    validateTwilioConfig();
    console.log('✅ Twilio Verify configuration validated successfully.');
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
