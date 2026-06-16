import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

otpSchema.index({ email: 1 });
otpSchema.index({ phone: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Otp', otpSchema);
