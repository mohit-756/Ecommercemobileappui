import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createShipment } from '../services/shippingPartner.js';

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

export async function createOrder(req, res, next) {
  try {
    const { shippingAddress, paymentMethod, notes, items: reqItems } = req.body;

    if (!reqItems || reqItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = reqItems.map(item => ({
      product: item.product,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || '',
      weight: item.weight || null,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shippingCost = subtotal > 500 ? 0 : 40;
    const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

    let razorpayOrder = null;
    if (paymentMethod === 'razorpay') {
      const rzp = getRazorpay();
      if (isDevMode()) {
        razorpayOrder = {
          id: 'order_dev_' + Date.now() + Math.random().toString(36).slice(2, 8),
          amount: Math.round(total * 100),
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          status: 'created',
        };
      } else if (rzp) {
        razorpayOrder = await rzp.orders.create({
          amount: Math.round(total * 100),
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        });
      } else {
        return res.status(400).json({ message: 'Razorpay not configured' });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails: {
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
        razorpayOrderId: razorpayOrder?.id,
      },
      subtotal,
      tax,
      shippingCost,
      total,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      tracking: [{
        status: 'placed',
        label: 'Order Placed',
        description: 'Your order has been placed successfully',
        timestamp: new Date(),
      }],
      notes,
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    for (const item of items) {
      try {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      } catch {
        // Skip stock update for non-ObjectId product IDs (e.g. mock data)
      }
    }

    if (order.status !== 'cancelled') {
      try {
        const shipment = await createShipment(order, shippingAddress);
        if (shipment) {
          order.courierDetails = {
            name: shipment.courierName,
            trackingId: shipment.trackingId,
            estimatedDelivery: shipment.estimatedDelivery,
          };
          await order.save();
        }
      } catch (err) {
        console.error('Shipping partner error:', err.message);
      }
    }

    res.status(201).json({
      order,
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!isDevMode()) {
      const body = order.paymentDetails.razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        order.paymentDetails.status = 'failed';
        await order.save();
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails.razorpaySignature = razorpaySignature;
    order.paymentDetails.status = 'paid';
    order.status = 'confirmed';
    order.tracking.push({
      status: 'confirmed',
      label: 'Order Confirmed',
      description: 'Payment received, order confirmed',
      timestamp: new Date(),
    });

    await order.save();

    res.json({ message: 'Payment verified', order });
  } catch (error) {
    next(error);
  }
}

export async function getUserOrders(req, res, next) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status, description } = req.body;

    const statusLabels = {
      confirmed: 'Order Confirmed',
      processing: 'Processing',
      packed: 'Packed',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: {
          tracking: {
            status,
            label: statusLabels[status] || status,
            description: description || `Order status updated to ${statusLabels[status] || status}`,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}
