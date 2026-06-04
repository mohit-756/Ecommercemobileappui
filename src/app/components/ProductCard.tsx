import { Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { cn, normalizeProduct } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: any;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product: raw, layout = 'grid' }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = normalizeProduct(raw);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, product);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast('Added to wishlist', { icon: <Heart size={16} fill="currentColor" className="text-red-500" /> });
  };

  if (layout === 'list') {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/product/${product.id}`)}
        className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-gray-100 mb-3 relative overflow-hidden"
      >
        <div className="w-24 h-24 rounded-xl bg-gray-100 flex-shrink-0 relative overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {product.discount && (
            <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
              -{product.discount}
            </div>
          )}
        </div>
        <div className="flex-1 py-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
          <div className="flex items-center gap-1 mb-auto">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviews})</span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice !== product.price && (
                <span className="text-xs text-gray-400 line-through ml-1.5">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleToggleWishlist} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
          <Heart size={18} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col relative group"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            {product.discount} OFF
          </div>
        )}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
        >
          <Heart size={16} />
        </button>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 leading-none">${product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice !== product.price && (
              <span className="text-[10px] text-gray-400 line-through mt-0.5">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
          >
            <span className="text-lg font-medium leading-none mb-0.5">+</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
