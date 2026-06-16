import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: String,
  weight: String,
  sku: { type: String, default: '' },
  category: { type: String, default: '' },
  packingStatus: { type: String, enum: ['not_packed', 'packed'], default: 'not_packed' },
  specialInstructions: { type: String, default: '' },
});

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, enum: ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'received', 'not_packed', 'processed', 'completed'] },
  label: String,
  description: String,
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  },
  subtotal: { type: Number, required: true, min: 0 },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: [
      'pending', 'confirmed', 'processing', 'packed', 'shipped', 
      'out_for_delivery', 'delivered', 'cancelled',
      'received', 'not_packed', 'processed', 'completed'
    ],
    default: 'pending',
  },
  fulfillmentType: { type: String, enum: ['pickup', 'delivery'], default: 'delivery' },
  timeSlot: { type: String, default: '' },
  fees: { type: Number, default: 0 },
  tips: { type: Number, default: 0 },
  refundHistory: [{
    amount: { type: Number, required: true },
    reason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  }],
  activityLogs: [{
    action: { type: String, required: true },
    actor: { type: String, default: 'System' },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  }],
  tracking: [trackingEventSchema],
  courierDetails: {
    name: String,
    trackingId: String,
    estimatedDelivery: Date,
  },
  notes: String,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
