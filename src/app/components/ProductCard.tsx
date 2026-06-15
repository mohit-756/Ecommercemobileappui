import { Star, Heart } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { cn, normalizeProduct, formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { hapticService } from '../services/hapticService';
import { wishlistService } from '../services/wishlistService';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: any;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product: raw, layout = 'grid' }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart, items, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const product = normalizeProduct(raw);
  const [isWishlist, setIsWishlist] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user_wishlist');
    if (saved) {
      const wl = JSON.parse(saved);
      setIsWishlist(wl.some((p: any) => (p.id || p._id) === (product.id || product._id)));
    }
  }, [product.id, product._id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('Item is out of stock');
      return;
    }
    try {
      await hapticService.impact();
      const weight = product.variants && product.variants.length > 0 ? product.variants[0].weight : null;
      await addToCart(product.id, raw, 1, weight);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const toggleSelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticService.impact();
    setIsSelectorOpen(!isSelectorOpen);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticService.impact();

    const saved = localStorage.getItem('user_wishlist');
    let wishlist = saved ? JSON.parse(saved) : [];

    const exists = wishlist.find((p: any) => (p.id || p._id) === (product.id || product._id));

    if (exists) {
      wishlist = wishlist.filter((p: any) => (p.id || p._id) !== (product.id || product._id));
      toast.success('Removed from wishlist');
      if (user) {
        wishlistService.removeFromWishlist(product.id || product._id).catch(() => {});
      }
    } else {
      wishlist.push(raw);
      toast.success('Added to wishlist');
      if (user) {
        wishlistService.addToWishlist(product.id || product._id).catch(() => {});
      }
    }

    localStorage.setItem('user_wishlist', JSON.stringify(wishlist));
    setIsWishlist(!exists);
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  if (layout === 'list') {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/product/${product.id}`)}
        className="bg-white dark:bg-surface rounded-2xl p-3 flex gap-4 shadow-sm border border-gray-100 dark:border-border-light mb-3 relative overflow-hidden"
      >
        <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-surface-tertiary flex-shrink-0 relative overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/products/cashews.webp'; }} />
          {product.discount && (
            <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
              -{product.discount}
            </div>
          )}
        </div>
        <div className="flex-1 py-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-text-primary text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
          <div className="flex items-center gap-1 mb-auto">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-600 dark:text-text-secondary font-medium">{product.rating}</span>
            <span className="text-xs text-gray-400 dark:text-text-tertiary">({product.reviews})</span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <span className="font-bold text-gray-900 dark:text-text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice !== product.price && (
                <span className="text-xs text-gray-400 dark:text-text-tertiary line-through ml-1.5">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleToggleWishlist} className={cn("absolute top-3 right-3 transition-colors", isWishlist ? "text-red-500" : "text-gray-400 dark:text-text-tertiary hover:text-red-500")}>
          <Heart size={18} className={isWishlist ? "fill-red-500" : ""} />
        </button>
      </motion.div>
    );
  }

  const hasVariants = product.variants && product.variants.length > 0;
  const displayPrice = hasVariants ? product.variants[0].price : product.price;
  const displayOriginalPrice = hasVariants ? product.variants[0].originalPrice : product.originalPrice;
  
  const discountText = hasVariants
    ? (product.variants[0].originalPrice && product.variants[0].originalPrice > product.variants[0].price
      ? `${Math.round((1 - product.variants[0].price / product.variants[0].originalPrice) * 100)}%`
      : null)
    : product.discount;

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate(`/product/${product.id}`)}
        className="bg-white dark:bg-surface rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-border-light flex flex-col relative group w-full transition-colors duration-300"
      >
        <div className="relative w-full h-[140px] sm:h-[150px] md:h-[160px] lg:h-[180px] aspect-square bg-gray-100 dark:bg-surface-tertiary overflow-hidden flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = '/images/products/cashews.webp'; }}
          />
          {discountText && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
              {discountText.includes('%') ? discountText : `${discountText} OFF`}
            </div>
          )}
          <button
            onClick={handleToggleWishlist}
            className={cn(
              "absolute top-2 right-2 w-8 h-8 bg-white/80 dark:bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center transition-colors z-10",
              isWishlist ? "text-red-500" : "text-gray-500 dark:text-text-secondary hover:text-red-500"
            )}
          >
            <Heart size={16} className={isWishlist ? "fill-red-500" : ""} />
          </button>
        </div>
        <div className="p-3 flex-1 flex flex-col min-h-0">
          <h3 className="font-semibold text-gray-900 dark:text-text-primary text-sm line-clamp-2 leading-tight h-9 mb-1 overflow-hidden">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2 h-5 mb-2">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-gray-600 dark:text-text-secondary font-medium">{product.rating}</span>
            </div>
            {(hasVariants || (product.sizes && product.sizes.length > 0)) && (
              <span className="text-[10px] bg-gray-100 dark:bg-surface-tertiary text-gray-600 dark:text-text-secondary px-1.5 py-0.5 rounded-md font-medium">
                {hasVariants ? product.variants[0].weight : product.sizes[0]}
              </span>
            )}
          </div>
          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div className="flex min-w-0 flex-col justify-end h-10">
              <span className="font-bold text-gray-900 dark:text-text-primary leading-none truncate">{formatPrice(displayPrice)}</span>
              {displayOriginalPrice && displayOriginalPrice !== displayPrice && (
                <span className="text-[10px] text-gray-400 dark:text-text-tertiary line-through mt-1 truncate">{formatPrice(displayOriginalPrice)}</span>
              )}
            </div>
            {hasVariants ? (
              <button
                onClick={toggleSelector}
                className="px-3 py-1.5 shrink-0 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all text-xs font-bold min-w-[56px] border border-blue-100 dark:border-blue-500/10 cursor-pointer"
              >
                <span className="leading-none">ADD</span>
                <span className="text-[7px] font-semibold leading-none mt-0.5">options</span>
              </button>
            ) : product.stock <= 0 ? (
              <span className="text-[10px] text-red-500 font-bold uppercase">Sold Out</span>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 shrink-0 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-lg font-medium leading-none mb-0.5">+</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Responsive Variant Selector Drawer/Modal */}
      {isSelectorOpen && createPortal(
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsSelectorOpen(false);
          }}
          className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm z-[999] flex items-end justify-center sm:items-center p-4 sm:p-4"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white dark:bg-surface rounded-3xl shadow-2xl p-6 border-t sm:border border-gray-100 dark:border-border-light max-h-[80vh] overflow-y-auto flex flex-col"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-border-light">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-text-primary text-base">Select Options</h3>
                <p className="text-xs text-gray-500 dark:text-text-secondary mt-0.5">{product.name}</p>
              </div>
              <button
                onClick={() => setIsSelectorOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-tertiary flex items-center justify-center text-gray-600 dark:text-text-secondary hover:bg-gray-200 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-2">
              {product.variants.map((v: any, idx: number) => {
                const discountVal = v.originalPrice && v.originalPrice > v.price
                  ? Math.round((1 - v.price / v.originalPrice) * 100)
                  : 0;
                
                const cartItem = items.find(
                  (item) => (item.product._id || item.product.id) === product.id && item.selectedWeight === v.weight
                );

                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-2xl bg-gray-50/50 dark:bg-surface-secondary/20 border border-gray-100 dark:border-border-light"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-text-primary">{v.weight}</span>
                        {discountVal > 0 && (
                          <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                            {discountVal}% OFF
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatPrice(v.price)}</span>
                        {v.originalPrice && v.originalPrice > v.price && (
                          <span className="text-[10px] text-gray-400 dark:text-text-tertiary line-through">{formatPrice(v.originalPrice)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      {v.stock <= 0 ? (
                        <span className="text-xs text-red-500 font-bold uppercase py-1.5 px-2">Sold Out</span>
                      ) : cartItem ? (
                        <div className="flex items-center bg-blue-50 dark:bg-blue-950/30 rounded-full p-0.5 border border-blue-100 dark:border-blue-900/50">
                          <button
                            onClick={() => {
                              hapticService.selection();
                              if (cartItem.quantity === 1) {
                                removeItem(cartItem._id);
                              } else {
                                updateQuantity(cartItem._id, cartItem.quantity - 1);
                              }
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-blue-900 dark:text-blue-200">{cartItem.quantity}</span>
                          <button
                            onClick={() => {
                              hapticService.selection();
                              if (cartItem.quantity >= v.stock) {
                                toast.error(`Only ${v.stock} items available in stock`);
                                return;
                              }
                              updateQuantity(cartItem._id, cartItem.quantity + 1);
                            }}
                            className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            hapticService.notificationSuccess();
                            addToCart(product.id, raw, 1, v.weight);
                            toast.success(`Added ${product.name} (${v.weight}) to cart`);
                          }}
                          className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}
