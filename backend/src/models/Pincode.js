import mongoose from 'mongoose';

const pincodeSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    match: /^\d{6}$/
  },
  serviceable: { 
    type: Boolean, 
    default: true 
  },
  estimatedDays: { 
    type: Number, 
    default: 3 
  }
}, { timestamps: true });

export default mongoose.model('Pincode', pincodeSchema);
