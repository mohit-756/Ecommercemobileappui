import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
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

    // Decrement stock atomically
    const decrementedItems = [];
    for (const item of items) {
      try {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          // Rollback already decremented products
          for (const decItem of decrementedItems) {
            await Product.findByIdAndUpdate(decItem.product, {
              $inc: { stock: decItem.quantity },
            });
          }
          return res.status(400).json({
            message: `Product "${item.name}" is out of stock or has insufficient inventory.`,
          });
        }
        decrementedItems.push(item);
      } catch (err) {
        if (err.name === 'CastError') {
          // Skip stock update for non-ObjectId product IDs (e.g. mock data)
          continue;
        }
        // Rollback on other DB errors
        for (const decItem of decrementedItems) {
          await Product.findByIdAndUpdate(decItem.product, {
            $inc: { stock: decItem.quantity },
          });
        }
        throw err;
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
    const {
      page = 1,
      limit = 20,
      status,
      fulfillmentType,
      timeSlot,
      startDate,
      endDate,
      customer,
      packingStatus,
      category,
      sort = '-createdAt'
    } = req.query;

    const filter = {};

    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }

    if (fulfillmentType) {
      filter.fulfillmentType = fulfillmentType;
    }

    if (timeSlot) {
      filter.timeSlot = timeSlot;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (customer) {
      if (mongoose.Types.ObjectId.isValid(customer)) {
        filter.user = customer;
      } else {
        const matchedUsers = await User.find({ name: { $regex: customer, $options: 'i' } }).select('_id');
        const userIds = matchedUsers.map(u => u._id);
        filter.user = { $in: userIds };
      }
    }

    if (packingStatus) {
      if (packingStatus === 'packed') {
        filter['items.packingStatus'] = { $ne: 'not_packed' };
      } else if (packingStatus === 'not_packed') {
        filter['items.packingStatus'] = 'not_packed';
      }
    }

    if (category) {
      let categoryId = category;
      if (!mongoose.Types.ObjectId.isValid(category)) {
        const matchedCat = await Category.findOne({ name: { $regex: category, $options: 'i' } });
        categoryId = matchedCat ? matchedCat._id : null;
      }
      if (categoryId) {
        const matchedProducts = await Product.find({ category: categoryId }).select('_id');
        const productIds = matchedProducts.map(p => p._id.toString());
        filter.$or = [
          { 'items.product': { $in: productIds } },
          { 'items.category': category }
        ];
      } else {
        filter['items.category'] = category;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    let sortObj = { createdAt: -1 };
    if (sort) {
      const field = sort.startsWith('-') ? sort.substring(1) : sort;
      const order = sort.startsWith('-') ? -1 : 1;
      sortObj = { [field]: order };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status, description } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.status;

    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        try {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        } catch {
        }
      }
    }

    order.status = status;
    const statusLabels = {
      confirmed: 'Order Confirmed',
      processing: 'Processing',
      packed: 'Packed',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      received: 'Received',
      not_packed: 'Not Packed',
      processed: 'Processed',
      completed: 'Completed',
    };

    order.tracking.push({
      status,
      label: statusLabels[status] || status,
      description: description || `Order status updated to ${statusLabels[status] || status}`,
      timestamp: new Date(),
    });

    if (!order.activityLogs) order.activityLogs = [];
    order.activityLogs.push({
      action: `Status Updated to ${status}`,
      actor: req.user?.name || 'Admin',
      details: description || `Status changed from ${previousStatus} to ${status}`,
      timestamp: new Date(),
    });

    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function getAdminDashboardStats(req, res, next) {
  try {
    const counts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const totalOrders = await Order.countDocuments();

    const received = (statsMap['received'] || 0) + (statsMap['confirmed'] || 0) + (statsMap['pending'] || 0);
    const notPacked = (statsMap['not_packed'] || 0) + (statsMap['processing'] || 0);
    const packed = (statsMap['packed'] || 0);
    const processed = (statsMap['processed'] || 0) + (statsMap['shipped'] || 0);
    const outForDelivery = (statsMap['out_for_delivery'] || 0);
    const completed = (statsMap['completed'] || 0) + (statsMap['delivered'] || 0);
    const cancelled = (statsMap['cancelled'] || 0);

    res.json({
      all: totalOrders,
      received,
      not_packed: notPacked,
      packed,
      processed,
      out_for_delivery: outForDelivery,
      completed,
      cancelled,
      rawStats: statsMap
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminAnalytics(req, res, next) {
  try {
    const { startDate, endDate, customer, fulfillmentType } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (customer) {
      if (mongoose.Types.ObjectId.isValid(customer)) {
        filter.user = customer;
      } else {
        const matchedUsers = await User.find({ name: { $regex: customer, $options: 'i' } }).select('_id');
        filter.user = { $in: matchedUsers.map(u => u._id) };
      }
    }

    if (fulfillmentType) {
      filter.fulfillmentType = fulfillmentType;
    }

    const orders = await Order.find(filter);

    const totalOrders = orders.length;
    const pickupOrders = orders.filter(o => o.fulfillmentType === 'pickup').length;
    const deliveryOrders = orders.filter(o => o.fulfillmentType === 'delivery').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    let totalRevenue = 0;
    let netSales = 0;
    let taxes = 0;
    let fees = 0;
    let tips = 0;
    let totalItemsCount = 0;

    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        totalRevenue += order.total || 0;
        taxes += order.tax || 0;
        fees += order.fees || 0;
        tips += order.tips || 0;
        netSales += (order.subtotal || 0);
      }
      order.items.forEach(item => {
        totalItemsCount += item.quantity || 0;
      });
    });

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const averageItemsPerOrder = totalOrders > 0 ? totalItemsCount / totalOrders : 0;

    res.json({
      totalOrders,
      pickupOrders,
      deliveryOrders,
      cancelledOrders,
      totalRevenue,
      netSales,
      taxes,
      fees,
      tips,
      averageOrderValue,
      averageItemsPerOrder,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateItemPackingStatus(req, res, next) {
  try {
    const { id, itemId } = req.params;
    const { packingStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    const oldStatus = item.packingStatus || 'not_packed';
    item.packingStatus = packingStatus;

    const allPacked = order.items.every(i => i.packingStatus === 'packed');
    const previousOrderStatus = order.status;

    if (allPacked && (previousOrderStatus === 'not_packed' || previousOrderStatus === 'received' || previousOrderStatus === 'processing')) {
      order.status = 'packed';
      order.tracking.push({
        status: 'packed',
        label: 'Packed',
        description: 'All items have been packed',
        timestamp: new Date(),
      });
    } else if (!allPacked && previousOrderStatus === 'packed') {
      order.status = 'not_packed';
    }

    if (!order.activityLogs) order.activityLogs = [];
    order.activityLogs.push({
      action: `Item Packing Status: ${packingStatus}`,
      actor: req.user?.name || 'Admin',
      details: `Item "${item.name}" changed packing status from ${oldStatus} to ${packingStatus}. Overall status: ${order.status}.`,
      timestamp: new Date(),
    });

    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function addOrderRefund(req, res, next) {
  try {
    const { amount, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.refundHistory) order.refundHistory = [];
    order.refundHistory.push({
      amount,
      reason: reason || 'N/A',
      timestamp: new Date(),
    });

    order.paymentDetails.status = 'refunded';

    if (!order.activityLogs) order.activityLogs = [];
    order.activityLogs.push({
      action: 'Refund Issued',
      actor: req.user?.name || 'Admin',
      details: `Issued refund of ₹${amount}. Reason: ${reason}.`,
      timestamp: new Date(),
    });

    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderNotes(req, res, next) {
  try {
    const { notes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.notes = notes;

    if (!order.activityLogs) order.activityLogs = [];
    order.activityLogs.push({
      action: 'Notes Updated',
      actor: req.user?.name || 'Admin',
      details: `Updated order notes.`,
      timestamp: new Date(),
    });

    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function adminCreateOrder(req, res, next) {
  try {
    const {
      customerId,
      items: reqItems,
      fulfillmentType,
      timeSlot,
      shippingAddress,
      paymentMethod,
      notes,
      fees = 0,
      tips = 0,
    } = req.body;

    const user = await User.findById(customerId);
    if (!user) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    const items = [];
    for (const item of reqItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      product.stock -= item.quantity;
      await product.save();

      items.push({
        product: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || '',
        weight: product.variants?.[0]?.weight || 'N/A',
        sku: product.variants?.[0]?.sku || product.tags?.[0] || 'SKU-TEMP',
        category: product.category ? product.category.toString() : 'Uncategorized',
        packingStatus: 'not_packed',
        specialInstructions: item.specialInstructions || '',
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shippingCost = fulfillmentType === 'pickup' ? 0 : (subtotal > 500 ? 0 : 40);
    const total = Math.round((subtotal + tax + shippingCost + Number(fees) + Number(tips)) * 100) / 100;

    const order = await Order.create({
      user: customerId,
      items,
      shippingAddress: fulfillmentType === 'pickup' ? {
        fullName: user.name,
        phone: user.phone || '9999999999',
        addressLine1: 'Store Pickup',
        city: 'Store Location',
        state: 'N/A',
        pincode: '000000',
      } : shippingAddress,
      paymentMethod,
      paymentDetails: {
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
      },
      subtotal,
      tax,
      shippingCost,
      fees,
      tips,
      total,
      status: 'received',
      fulfillmentType,
      timeSlot,
      notes,
      activityLogs: [{
        action: 'Order Created',
        actor: req.user?.name || 'Admin',
        details: `Order created by admin for customer ${user.name}.`,
        timestamp: new Date(),
      }],
      tracking: [{
        status: 'received',
        label: 'Received',
        description: 'Order received and is being processed.',
        timestamp: new Date(),
      }],
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}
