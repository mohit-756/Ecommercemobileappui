import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Heart, ShoppingBag } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';

export function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('user_wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }

    const handleUpdate = () => {
      const updated = localStorage.getItem('user_wishlist');
      if (updated) setWishlist(JSON.parse(updated));
      else setWishlist([]);
    };

    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, []);

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 md:pt-6 md:rounded-t-[32px] border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">My Wishlist</h1>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {wishlist.length > 0 ? (
            <div className="space-y-1">
              {wishlist.map((product) => (
                <motion.div
                  key={product.id || product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <ProductCard product={product} layout="list" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={36} className="text-gray-300" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 text-sm mb-8">Save items you love to find them later!</p>
              <button
                onClick={() => navigate('/home')}
                className="bg-blue-600 text-white font-semibold rounded-xl py-3 px-8 shadow-lg shadow-blue-200"
              >
                Explore Products
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
