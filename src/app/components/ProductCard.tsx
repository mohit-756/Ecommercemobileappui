import { Star, Heart } from 'lucide-react';
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
  const { addToCart } = useCart();
  const { user } = useAuth();
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
    try {
      await hapticService.impact();
      await addToCart(product.id, product);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
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

  return (
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
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            {product.discount} OFF
          </div>
        )}
        <button
          onClick={handleToggleWishlist}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 bg-white/80 dark:bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center transition-colors",
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
        <div className="flex items-center gap-1 h-5 mb-2">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-xs text-gray-600 dark:text-text-secondary font-medium">{product.rating}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex min-w-0 flex-col justify-end h-10">
            <span className="font-bold text-gray-900 dark:text-text-primary leading-none truncate">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice !== product.price && (
              <span className="text-[10px] text-gray-400 dark:text-text-tertiary line-through mt-1 truncate">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-8 h-8 shrink-0 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors"
          >
            <span className="text-lg font-medium leading-none mb-0.5">+</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
