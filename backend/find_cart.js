import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Cart from './src/models/Cart.js';

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
    console.log('User found:', user.name, user._id, user.phone);

    const cart = await Cart.findOne({ user: user._id }).populate('items.product');
    if (!cart) {
      console.log('Cart not found!');
      return;
    }
    console.log('Cart items:');
    for (const item of cart.items) {
      console.log({
        product_id: item.product?._id,
        name: item.product?.name,
        price: item.selectedPrice || item.product?.price,
        quantity: item.quantity,
        stock: item.product?.stock
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
