import 'dotenv/config';
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
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
}));
app.use(express.json());

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

app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
