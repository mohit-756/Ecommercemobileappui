import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ShoppingCart, X } from 'lucide-react';
import { formatPrice } from '../lib/utils';

interface PopupProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  selectedWeight?: string;
}

interface AddToCartPopupProps {
  product: PopupProduct;
  isOpen: boolean;
  onClose: () => void;
  cartSubtotal: number;
  cartItemCount: number;
}

const AUTO_CLOSE_MS = 3000;

export function AddToCartPopup({ product, isOpen, onClose, cartSubtotal, cartItemCount }: AddToCartPopupProps) {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Start progress bar animation
    if (progressRef.current) {
      progressRef.current.style.transition = 'none';
      progressRef.current.style.width = '100%';
      // Force reflow
      progressRef.current.getBoundingClientRect();
      progressRef.current.style.transition = `width ${AUTO_CLOSE_MS}ms linear`;
      progressRef.current.style.width = '0%';
    }

    timerRef.current = setTimeout(() => {
      onClose();
    }, AUTO_CLOSE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, onClose]);

  const handleGoToCart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onClose();
    setTimeout(() => navigate('/cart'), 200);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - subtle, doesn't block the whole page */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000]"
            style={{ pointerEvents: 'none' }}
          />

          {/* Popup card */}
          <motion.div
            key="popup"
            initial={{ y: 120, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] left-3 right-3 z-[1001] sm:left-auto sm:right-4 sm:w-[360px] lg:bottom-6"
          >
            <div className="bg-white/90 dark:bg-surface/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden">
              {/* Progress bar */}
              <div className="h-0.5 bg-gray-100/50 dark:bg-surface-tertiary/50 w-full">
                <div
                  ref={progressRef}
                  className="h-full bg-amber-500"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path
                          d="M20 6L9 17L4 12"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
                        />
                      </svg>
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-text-primary">Added to Cart!</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-gray-100/65 dark:bg-surface-tertiary/65 flex items-center justify-center text-gray-500 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-surface-secondary transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Product info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-surface-tertiary flex-shrink-0 overflow-hidden border border-amber-100 dark:border-border-light">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/images/products/cashews.webp'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-text-primary line-clamp-1 leading-tight">
                      {product.name}
                    </p>
                    {product.selectedWeight && (
                      <p className="text-xs text-gray-500 dark:text-text-secondary mt-0.5">{product.selectedWeight}</p>
                    )}
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                {/* Cart summary strip */}
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl px-3 py-2 mb-3">
                  <ShoppingCart size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                    {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} · {formatPrice(cartSubtotal)} in your cart
                  </span>
                </div>

                {/* Go to Cart button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoToCart}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  }}
                >
                  <ShoppingCart size={15} />
                  Go to Cart
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
