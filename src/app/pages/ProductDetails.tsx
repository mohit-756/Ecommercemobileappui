import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Heart, Share2, Star, Minus, Plus, ShoppingBag } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { products } from '../data/mock';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emblaRef] = useEmblaCarousel();
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);

  // Fallback to first product if not found
  const product = products.find(p => p.id === id) || products[0];

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} to cart`);
  };

  return (
    <div className="min-h-full bg-white flex flex-col pb-24 md:pb-6 relative">
      {/* Header - Transparent overlay on image */}
      <div className="absolute top-0 w-full z-10 flex justify-between items-center px-6 pt-12 md:pt-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3">
          <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-sm">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="h-[400px] bg-gray-100 relative overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="flex-[0_0_100%] h-full relative">
              <img 
                src={product.image} 
                alt={`${product.name} - View ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        {/* Pagination Dots mock */}
        <div className="absolute bottom-6 w-full flex justify-center gap-2">
          <div className="w-6 h-1.5 bg-blue-600 rounded-full" />
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 pb-32 flex-1 flex flex-col bg-white -mt-4 rounded-t-3xl relative z-20 overflow-y-auto">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-blue-600 font-medium text-sm mb-1">{product.category}</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
          </div>
          <button 
            onClick={() => setIsWishlist(!isWishlist)}
            className="mt-1 flex-shrink-0"
          >
            <Heart 
              size={24} 
              className={cn("transition-colors", isWishlist ? "text-red-500 fill-red-500" : "text-gray-400")} 
            />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <span className="font-bold text-amber-700">{product.rating}</span>
          </div>
          <span className="text-gray-500 text-sm underline">{product.reviews} reviews</span>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Mock Options (Colors/Sizes depending on product) */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Color</h3>
          <div className="flex gap-3">
            {['bg-black', 'bg-gray-200', 'bg-blue-200'].map((color, idx) => (
              <button 
                key={idx}
                className={cn(
                  "w-10 h-10 rounded-full border-2",
                  idx === 0 ? "border-blue-600 p-0.5" : "border-transparent"
                )}
              >
                <div className={cn("w-full h-full rounded-full", color)} />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed md:absolute bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-8 flex items-center gap-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50 md:rounded-b-[32px]">
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 font-medium">Total Price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-full px-1 ml-auto">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-900 my-1 mr-1"
          >
            <Plus size={16} />
          </button>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className="flex-1 bg-blue-600 text-white font-semibold rounded-full py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <ShoppingBag size={20} />
          <span>Add</span>
        </motion.button>
      </div>
    </div>
  );
}