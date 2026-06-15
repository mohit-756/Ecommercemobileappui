import Pincode from '../models/Pincode.js';

export async function checkPincode(req, res, next) {
  try {
    const { pincode } = req.params;

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Invalid pincode format' });
    }

    let record = await Pincode.findOne({ code: pincode });

    const defaultPincodes = ['110001', '110002', '400001', '400002', '700001', '600001', '756922'];
    let isServiceable = false;
    let estimatedDays = null;

    if (record) {
      isServiceable = record.serviceable;
      estimatedDays = record.estimatedDays;
    } else {
      isServiceable = defaultPincodes.includes(pincode);
      estimatedDays = isServiceable ? Math.floor(Math.random() * 4) + 2 : null;

      try {
        await Pincode.create({
          code: pincode,
          serviceable: isServiceable,
          estimatedDays: estimatedDays || 3,
        });
      } catch {
        // Ignore parallel insertion conflicts
      }
    }

    res.json({
      pincode,
      serviceable: isServiceable,
      estimatedDays,
      message: isServiceable ? 'Delivery available' : 'Sorry, we do not deliver to this pincode yet',
    });
  } catch (error) {
    next(error);
  }
}

export async function calculateShipping(req, res, next) {
  try {
    const { pincode, subtotal } = req.body;

    if (subtotal >= 500) {
      return res.json({ cost: 0, method: 'Free Delivery', estimatedDays: '3-5 business days' });
    }

    res.json({
      cost: 40,
      method: 'Standard Delivery',
      estimatedDays: '3-5 business days',
    });
  } catch (error) {
    next(error);
  }
}
