import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { normalizeProduct } from '../lib/utils';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartItem {
  _id: string;
  product: any;
  quantity: number;
  selectedWeight?: string;
  selectedPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, product?: any, quantity?: number, selectedWeight?: string) => Promise<void>;
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
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAndSyncCart() {
      if (!token) {
        setItems(getGuestCart());
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
          for (const item of guestItems) {
            const prodId = item.product._id || item.product.id;
            await cartService.addToCart(prodId, item.quantity, item.selectedWeight);
          }
          localStorage.removeItem(GUEST_CART_KEY);
        }

        const res = await cartService.getCart();
        const serverCart = res.data;
        const normalized = (serverCart.items || [])
          .map((item: any) => ({
            _id: item._id,
            product: normalizeProduct(item.product),
            quantity: item.quantity,
            selectedWeight: item.selectedWeight,
            selectedPrice: item.selectedPrice,
          }))
          .filter((item: any) => item.product !== null);
        setItems(normalized);
      } catch (err) {
        console.error('Failed to sync/fetch backend cart:', err);
        setItems(getGuestCart());
      } finally {
        setLoading(false);
      }
    }

    loadAndSyncCart();
  }, [token]);

  const addToCart = useCallback(async (productId: string, product?: any, quantity = 1, selectedWeight?: string) => {
    if (token) {
      try {
        const res = await cartService.addToCart(productId, quantity, selectedWeight);
        const normalized = (res.data.items || [])
          .map((item: any) => ({
            _id: item._id,
            product: normalizeProduct(item.product),
            quantity: item.quantity,
            selectedWeight: item.selectedWeight,
            selectedPrice: item.selectedPrice,
          }))
          .filter((item: any) => item.product !== null);
        setItems(normalized);
      } catch (err) {
        console.error('Failed to add to cart on server:', err);
        throw err;
      }
    } else {
      const guest = getGuestCart();
      const existing = guest.find(
        (item) => (item.product._id || item.product.id) === productId && item.selectedWeight === selectedWeight
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        let guestPrice = product?.price || 0;
        if (selectedWeight && product?.variants?.length > 0) {
          const variant = product.variants.find((v: any) => v.weight === selectedWeight);
          if (variant) {
            guestPrice = variant.price;
          }
        } else if (product?.variants?.length > 0) {
          guestPrice = product.variants[0].price;
        }

        guest.push({
          _id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          product: normalizeProduct(product || { _id: productId }),
          quantity,
          selectedWeight: selectedWeight || product?.variants?.[0]?.weight || undefined,
          selectedPrice: guestPrice,
        });
      }
      setGuestCart(guest);
      setItems([...guest]);
    }
  }, [token]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    if (token) {
      try {
        const res = await cartService.updateCartItem(itemId, quantity);
        const normalized = (res.data.items || [])
          .map((item: any) => ({
            _id: item._id,
            product: normalizeProduct(item.product),
            quantity: item.quantity,
            selectedWeight: item.selectedWeight,
            selectedPrice: item.selectedPrice,
          }))
          .filter((item: any) => item.product !== null);
        setItems(normalized);
      } catch (err) {
        console.error('Failed to update cart item on server:', err);
        throw err;
      }
    } else {
      const guest = getGuestCart();
      const item = guest.find((i) => i._id === itemId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        setGuestCart(guest);
        setItems([...guest]);
      }
    }
  }, [token]);

  const removeItem = useCallback(async (itemId: string) => {
    if (token) {
      try {
        const res = await cartService.removeFromCart(itemId);
        const normalized = (res.data.items || [])
          .map((item: any) => ({
            _id: item._id,
            product: normalizeProduct(item.product),
            quantity: item.quantity,
            selectedWeight: item.selectedWeight,
            selectedPrice: item.selectedPrice,
          }))
          .filter((item: any) => item.product !== null);
        setItems(normalized);
      } catch (err) {
        console.error('Failed to remove cart item from server:', err);
        throw err;
      }
    } else {
      const guest = getGuestCart().filter((i) => i._id !== itemId);
      setGuestCart(guest);
      setItems(guest);
    }
  }, [token]);

  const clearCart = useCallback(async () => {
    if (token) {
      try {
        await cartService.clearCart();
        setItems([]);
      } catch (err) {
        console.error('Failed to clear cart on server:', err);
        throw err;
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
      setItems([]);
    }
  }, [token]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.selectedPrice !== undefined && i.selectedPrice !== null ? i.selectedPrice : (i.product.price || 0)) * i.quantity, 0),
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
