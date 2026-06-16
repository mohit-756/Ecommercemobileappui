import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Order from './models/Order.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';

const timeSlots = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM'
];

async function seedOrders() {
  await connectDB();

  // Remove existing orders
  await Order.deleteMany({});
  console.log('Cleared existing orders');

  // Find or create guest user
  let guest = await User.findOne({ email: 'guest@dryfruit.com' });
  if (!guest) {
    guest = await User.create({
      name: 'Guest User',
      email: 'guest@dryfruit.com',
      password: 'guest0000',
      role: 'user',
      phone: '9876543210'
    });
    console.log('Created guest user');
  }

  // Find products
  const products = await Product.find().populate('category');
  if (products.length === 0) {
    console.error('No products found in DB! Please seed products first using node src/seed.js');
    await mongoose.connection.close();
    process.exit(1);
  }

  console.log(`Found ${products.length} products to create order items.`);

  const ordersToInsert = [];

  // Generate 25 orders spanning the last 30 days
  const statuses = ['received', 'not_packed', 'packed', 'processed', 'out_for_delivery', 'completed', 'cancelled'];
  const fulfillmentTypes = ['pickup', 'delivery'];

  const now = new Date();

  for (let i = 0; i < 25; i++) {
    // Random status
    const status = statuses[i % statuses.length];
    const fulfillmentType = fulfillmentTypes[i % fulfillmentTypes.length];
    
    // Pick 1-3 random products
    const itemsCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < itemsCount; j++) {
      const prod = products[(i + j * 3) % products.length];
      const quantity = Math.floor(Math.random() * 2) + 1;
      const price = prod.price;
      subtotal += price * quantity;

      items.push({
        product: prod._id.toString(),
        name: prod.name,
        price: price,
        quantity: quantity,
        image: prod.images?.[0] || '',
        weight: prod.variants?.[0]?.weight || '250g',
        sku: prod.variants?.[0]?.sku || `SKU-${prod.name.toUpperCase().substring(0, 3)}-${prod.variants?.[0]?.weight || '250'}`,
        category: prod.category ? prod.category.name : 'Nuts',
        packingStatus: status === 'received' || status === 'not_packed' ? 'not_packed' : 'packed',
        specialInstructions: j % 2 === 0 ? 'Pack with extra bubble wrap.' : '',
      });
    }

    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shippingCost = fulfillmentType === 'pickup' ? 0 : (subtotal > 500 ? 0 : 40);
    const fees = i % 3 === 0 ? 5 : 0;
    const tips = i % 4 === 0 ? 20 : (i % 7 === 0 ? 50 : 0);
    const total = subtotal + tax + shippingCost + fees + tips;

    // Date spread over 30 days
    const orderDate = new Date();
    orderDate.setDate(now.getDate() - (i * 1.2)); // older dates

    const tracking = [
      {
        status: 'received',
        label: 'Received',
        description: 'Order received by store.',
        timestamp: new Date(orderDate.getTime()),
      }
    ];

    if (status !== 'received') {
      const date2 = new Date(orderDate.getTime() + 10 * 60 * 1000);
      tracking.push({
        status: 'not_packed',
        label: 'Not Packed',
        description: 'Order added to packing queue.',
        timestamp: date2,
      });
    }

    if (status !== 'received' && status !== 'not_packed') {
      const date3 = new Date(orderDate.getTime() + 30 * 60 * 1000);
      tracking.push({
        status: 'packed',
        label: 'Packed',
        description: 'All items picked and packed.',
        timestamp: date3,
      });
    }

    if (status === 'processed' || status === 'out_for_delivery' || status === 'completed') {
      const date4 = new Date(orderDate.getTime() + 45 * 60 * 1000);
      tracking.push({
        status: 'processed',
        label: 'Processed',
        description: 'Order processed and ready for courier handoff.',
        timestamp: date4,
      });
    }

    if (status === 'out_for_delivery' || status === 'completed') {
      const date5 = new Date(orderDate.getTime() + 60 * 60 * 1000);
      tracking.push({
        status: 'out_for_delivery',
        label: 'Out for Delivery',
        description: 'Courier agent has picked up the order.',
        timestamp: date5,
      });
    }

    if (status === 'completed') {
      const date6 = new Date(orderDate.getTime() + 90 * 60 * 1000);
      tracking.push({
        status: 'completed',
        label: 'Completed',
        description: 'Order delivered successfully.',
        timestamp: date6,
      });
    }

    if (status === 'cancelled') {
      tracking.push({
        status: 'cancelled',
        label: 'Cancelled',
        description: 'Order cancelled.',
        timestamp: new Date(orderDate.getTime() + 15 * 60 * 1000),
      });
    }

    const activityLogs = tracking.map(t => ({
      action: `Status Update: ${t.label}`,
      actor: 'System Admin',
      details: t.description,
      timestamp: t.timestamp,
    }));

    const refundHistory = [];
    if (status === 'cancelled' && i % 2 === 0) {
      refundHistory.push({
        amount: total,
        reason: 'Customer cancelled the order.',
        timestamp: new Date(orderDate.getTime() + 20 * 60 * 1000),
      });
    }

    ordersToInsert.push({
      user: guest._id,
      items,
      shippingAddress: {
        fullName: 'John Doe',
        phone: '9876543210',
        addressLine1: 'Flat 402, Royal Residency',
        addressLine2: 'Sector 5, HSR Layout',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560102',
        landmark: 'Near HSR Club',
      },
      paymentMethod: i % 2 === 0 ? 'razorpay' : 'cod',
      paymentDetails: {
        razorpayOrderId: i % 2 === 0 ? `order_rzp_${i}` : undefined,
        status: status === 'completed' || i % 2 === 0 ? 'paid' : (status === 'cancelled' && i % 2 === 0 ? 'refunded' : 'pending'),
      },
      subtotal,
      shippingCost,
      tax,
      fees,
      tips,
      total,
      status,
      fulfillmentType,
      timeSlot: timeSlots[i % timeSlots.length],
      notes: i % 5 === 0 ? 'Customer requested late delivery.' : '',
      refundHistory,
      activityLogs,
      tracking,
      createdAt: orderDate,
      updatedAt: orderDate,
    });
  }

  const seeded = await Order.insertMany(ordersToInsert);
  console.log(`Successfully seeded ${seeded.length} orders!`);

  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
}

seedOrders().catch(err => {
  console.error('Failed to seed orders:', err);
  process.exit(1);
});
