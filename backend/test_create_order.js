import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import Cart from './src/models/Cart.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import Razorpay from 'razorpay';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

function isDevMode() {
  return process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id'
    || process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_key_secret'
    || !process.env.RAZORPAY_KEY_ID
    || !process.env.RAZORPAY_KEY_SECRET;
}

function getRazorpay() {
  if (isDevMode()) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

async function run() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Database connected!');

  try {
    // 1. Find a cart with items
    console.log('Looking for a cart with items...');
    let cart = await Cart.findOne({ items: { $not: { $size: 0 } } }).populate('items.product');
    
    if (!cart) {
      console.log('No cart found with items. Finding any user to set up a cart...');
      const user = await User.findOne();
      if (!user) {
        throw new Error('No users found in database!');
      }
      const product = await Product.findOne();
      if (!product) {
        throw new Error('No products found in database!');
      }
      console.log(`Setting up mock cart for user ${user.name} / ${user._id} with product ${product.name}`);
      cart = await Cart.findOneAndUpdate(
        { user: user._id },
        { items: [{ product: product._id, quantity: 1, selectedPrice: product.price }] },
        { new: true, upsert: true }
      ).populate('items.product');
    }

    console.log(`Using cart belonging to user ID: ${cart.user}`);
    
    // Filter out items with null products (deleted products)
    const validCartItems = cart.items.filter(item => item.product !== null);
    if (validCartItems.length === 0) {
      console.log('Cart has items but all products are null (deleted). Setting up a clean item...');
      const product = await Product.findOne();
      validCartItems.push({
        product: product,
        quantity: 1,
        selectedPrice: product.price
      });
    }

    console.log('Cart items:', validCartItems.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.selectedPrice || item.product.price
    })));

    const shippingAddress = {
      fullName: 'Test User',
      phone: '9999999999',
      addressLine1: '123 Test Street',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081'
    };

    const paymentMethod = 'razorpay';
    
    console.log('Mapping items...');
    const items = validCartItems.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.selectedPrice !== undefined && item.selectedPrice !== null ? item.selectedPrice : item.product.price,
      quantity: item.quantity,
      image: item.product.image || item.product.images?.[0] || '',
      weight: item.selectedWeight || null,
    }));

    console.log('Calculating prices...');
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shippingCost = subtotal >= 500 ? 0 : 40;
    const handlingCharge = 2;
    const total = Math.round((subtotal + tax + shippingCost + handlingCharge) * 100) / 100;

    console.log(`Subtotal: ${subtotal}, Tax: ${tax}, Shipping: ${shippingCost}, Handling: ${handlingCharge}, Total: ${total}`);

    console.log('Initializing Razorpay...');
    let razorpayOrder = null;
    if (paymentMethod === 'razorpay') {
      const rzp = getRazorpay();
      console.log('Is dev mode:', isDevMode());
      if (isDevMode()) {
        razorpayOrder = {
          id: 'order_dev_' + Date.now(),
          amount: Math.round(total * 100),
          status: 'created'
        };
      } else if (rzp) {
        console.log('Calling rzp.orders.create...');
        razorpayOrder = await rzp.orders.create({
          amount: Math.round(total * 100),
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        });
        console.log('rzp.orders.create call completed successfully!', razorpayOrder.id);
      } else {
        throw new Error('Razorpay not configured');
      }
    }

    console.log('Decrementing stock atomically...');
    const decrementedItems = [];
    for (const item of items) {
      console.log(`Updating stock for product ${item.name} (${item.product})...`);
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        // Rollback
        for (const decItem of decrementedItems) {
          await Product.findByIdAndUpdate(decItem.product, {
            $inc: { stock: decItem.quantity },
          });
        }
        throw new Error(`Product "${item.name}" is out of stock`);
      }
      decrementedItems.push(item);
      console.log(`Stock updated successfully. Remaining stock: ${updatedProduct.stock}`);
    }

    console.log('Creating order document in DB...');
    const order = await Order.create({
      user: cart.user,
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails: {
        status: 'pending',
        razorpayOrderId: razorpayOrder?.id,
      },
      subtotal,
      tax,
      shippingCost,
      fees: handlingCharge,
      total,
      status: 'pending',
      tracking: [{
        status: 'placed',
        label: 'Order Placed',
        description: 'Your order has been placed successfully',
        timestamp: new Date(),
      }]
    });

    console.log('Order created successfully in DB!', order._id);

    console.log('Clearing cart...');
    await Cart.findOneAndUpdate({ user: cart.user }, { items: [] });
    console.log('Cart cleared successfully!');

  } catch (err) {
    console.error('CRITICAL ERROR:', err);
  } finally {
    console.log('Disconnecting database...');
    await mongoose.disconnect();
    console.log('Disconnected!');
  }
}

run();
