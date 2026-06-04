import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Heart, Share2, Star, Minus, Plus, ShoppingBag } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { cn, normalizeProduct } from '../lib/utils';
import { motion } from 'motion/react';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [emblaRef] = useEmblaCarousel();
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    productService.getProductById(id)
      .then(res => setProduct(normalizeProduct(res.data)))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, product, quantity);
      toast.success(`Added ${quantity} to cart`);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="min-h-full bg-white flex flex-col pb-24 md:pb-6 relative">
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

      <div className="h-[400px] bg-gray-100 relative overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {product.images.length > 0 ? (
            product.images.map((img: string, idx: number) => (
              <div key={idx} className="flex-[0_0_100%] h-full relative">
                <img src={img} alt={`${product.name} - View ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            <div className="flex-[0_0_100%] h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>
        <div className="absolute bottom-6 w-full flex justify-center gap-2">
          {product.images.map((_: any, idx: number) => (
            <div key={idx} className={cn("w-1.5 h-1.5 rounded-full", idx === 0 ? "w-6 bg-blue-600" : "bg-white/60")} />
          ))}
        </div>
      </div>

      <div className="px-6 pt-6 pb-32 flex-1 flex flex-col bg-white -mt-4 rounded-t-3xl relative z-20 overflow-y-auto">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-blue-600 font-medium text-sm mb-1">{product.category}</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
          </div>
          <button
            onClick={() => { setIsWishlist(!isWishlist); toast(isWishlist ? 'Removed from wishlist' : 'Added to wishlist'); }}
            className="mt-1 flex-shrink-0"
          >
            <Heart size={24} className={cn("transition-colors", isWishlist ? "text-red-500 fill-red-500" : "text-gray-400")} />
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
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-3">Color</h3>
            <div className="flex gap-3">
              {product.colors.map((c: any, idx: number) => (
                <button key={idx} className={cn("w-10 h-10 rounded-full border-2", idx === 0 ? "border-blue-600 p-0.5" : "border-transparent")}>
                  <div className="w-full h-full rounded-full" style={{ backgroundColor: c.hex || c.name }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-3">Size</h3>
            <div className="flex gap-3">
              {product.sizes.map((s: string, idx: number) => (
                <button key={idx} className={cn("px-4 py-2 rounded-xl border text-sm font-medium transition-colors", idx === 1 ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed md:absolute bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-8 flex items-center gap-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50 md:rounded-b-[32px]">
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 font-medium">Total Price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-full px-1 ml-auto">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600">
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-900 my-1 mr-1">
            <Plus size={16} />
          </button>
        </div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart} className="flex-1 bg-blue-600 text-white font-semibold rounded-full py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
          <ShoppingBag size={20} />
          <span>Add</span>
        </motion.button>
      </div>
    </div>
  );
}
