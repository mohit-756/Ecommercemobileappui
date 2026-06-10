import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: String,
});

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, enum: ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'] },
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
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  tracking: [trackingEventSchema],
  courierDetails: {
    name: String,
    trackingId: String,
    estimatedDelivery: Date,
  },
  notes: String,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
