import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export async function getCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = { items: [] };
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1, selectedWeight } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let resolvedPrice = product.price;
    let weightToSave = selectedWeight || null;

    if (selectedWeight && product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.weight === selectedWeight);
      if (variant) {
        resolvedPrice = variant.price;
      }
    } else if (product.variants && product.variants.length > 0) {
      // Default to first variant if none selected
      weightToSave = product.variants[0].weight;
      resolvedPrice = product.variants[0].price;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.selectedWeight === weightToSave
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].selectedPrice = resolvedPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        selectedWeight: weightToSave,
        selectedPrice: resolvedPrice
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function removeFromCart(req, res, next) {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
}
