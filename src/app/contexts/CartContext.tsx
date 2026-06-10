import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(getGuestCart());
    setLoading(false);
  }, []);

  const addToCart = useCallback(async (productId: string, product?: any, quantity = 1) => {
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
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const guest = getGuestCart();
    const item = guest.find((i) => i._id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      setGuestCart(guest);
      setItems([...guest]);
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    const guest = getGuestCart().filter((i) => i._id !== itemId);
    setGuestCart(guest);
    setItems(guest);
  }, []);

  const clearCart = useCallback(async () => {
    localStorage.removeItem(GUEST_CART_KEY);
    setItems([]);
  }, []);

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
