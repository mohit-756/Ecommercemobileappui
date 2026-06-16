import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import Order from './src/models/Order.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI);
  try {
    const user = await User.findOne({ $or: [{ phone: '7569221183' }, { name: /MOHIT/i }] });
    if (!user) {
      console.log('User not found!');
      return;
    }
    console.log('User found:', user.name, user._id);

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${orders.length} recent orders:`);
    for (const order of orders) {
      console.log({
        order_id: order._id,
        createdAt: order.createdAt,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        paymentStatus: order.paymentDetails?.status,
        razorpayOrderId: order.paymentDetails?.razorpayOrderId
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
