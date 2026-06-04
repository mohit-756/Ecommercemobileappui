import Address from '../models/Address.js';

export async function getAddresses(req, res, next) {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req, res, next) {
  try {
    const data = { ...req.body, user: req.user._id };

    if (data.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create(data);
    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const data = { ...req.body };

    if (data.isDefault) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: req.params.id } }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      data,
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(address);
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
}

export async function setDefaultAddress(req, res, next) {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json(address);
  } catch (error) {
    next(error);
  }
}
