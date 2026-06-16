import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useCart } from './CartContext';
import { AddToCartPopup } from '../components/AddToCartPopup';

interface PopupProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  selectedWeight?: string;
}

interface AddToCartPopupContextType {
  showAddToCartPopup: (product: PopupProduct) => void;
}

const AddToCartPopupContext = createContext<AddToCartPopupContextType | null>(null);

export function AddToCartPopupProvider({ children }: { children: ReactNode }) {
  const [popupProduct, setPopupProduct] = useState<PopupProduct | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { subtotal, itemCount } = useCart();

  const showAddToCartPopup = useCallback((product: PopupProduct) => {
    setPopupProduct(product);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setPopupProduct(null), 400);
  }, []);

  return (
    <AddToCartPopupContext.Provider value={{ showAddToCartPopup }}>
      {children}
      {popupProduct && (
        <AddToCartPopup
          product={popupProduct}
          isOpen={isOpen}
          onClose={handleClose}
          cartSubtotal={subtotal}
          cartItemCount={itemCount}
        />
      )}
    </AddToCartPopupContext.Provider>
  );
}

export function useAddToCartPopup() {
  const context = useContext(AddToCartPopupContext);
  if (!context) throw new Error('useAddToCartPopup must be used within AddToCartPopupProvider');
  return context;
}
