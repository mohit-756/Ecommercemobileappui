import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { normalizeProduct } from '../lib/utils';

interface CartItem {
  _id: string;
  product: any;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, product?: any, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

const GUEST_CART_KEY = 'guest_cart';

function getGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!user;

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      if (items.length > 0) {
        setGuestCart(items);
      }
      setItems(getGuestCart());
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cartService.getCart();
      const cartItems = (res.data.items || []).map((item: any) => ({
        ...item,
        product: normalizeProduct(item.product || {}),
      }));
      setItems(cartItems);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeGuestCart = useCallback(async () => {
    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;

    for (const item of guestItems) {
      try {
        await cartService.addToCart(item.product._id || item.product.id, item.quantity);
      } catch {
        // skip failed items
      }
    }
    localStorage.removeItem(GUEST_CART_KEY);
    await fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (isLoggedIn && items.length === 0 && !loading) {
      const guestItems = getGuestCart();
      if (guestItems.length > 0) {
        mergeGuestCart();
      }
    }
  }, [isLoggedIn, loading]);

  const addToCart = useCallback(async (productId: string, product?: any, quantity = 1) => {
    if (isLoggedIn) {
      await cartService.addToCart(productId, quantity);
      await fetchCart();
    } else {
      const guest = getGuestCart();
      const existing = guest.find(
        (item) => (item.product._id || item.product.id) === productId
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        guest.push({
          _id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          product: normalizeProduct(product || { _id: productId }),
          quantity,
        });
      }
      setGuestCart(guest);
      setItems([...guest]);
    }
  }, [isLoggedIn, fetchCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (isLoggedIn) {
      await cartService.updateCartItem(itemId, quantity);
      await fetchCart();
    } else {
      const guest = getGuestCart();
      const item = guest.find((i) => i._id === itemId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        setGuestCart(guest);
        setItems([...guest]);
      }
    }
  }, [isLoggedIn, fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    if (isLoggedIn) {
      await cartService.removeFromCart(itemId);
      await fetchCart();
    } else {
      const guest = getGuestCart().filter((i) => i._id !== itemId);
      setGuestCart(guest);
      setItems(guest);
    }
  }, [isLoggedIn, fetchCart]);

  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      await cartService.clearCart();
      await fetchCart();
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
      setItems([]);
    }
  }, [isLoggedIn, fetchCart]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.product.price || 0) * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, itemCount, loading, addToCart, updateQuantity, removeItem, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
