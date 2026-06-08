import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, Bell, LayoutGrid, Smartphone, Shirt, Home as HomeIcon, Sparkles,
  ShoppingCart, Milk, Candy, CupSoda, Apple, Watch, Backpack,
  Clock, Zap, ArrowRight, Star, MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductCard } from '../components/ProductCard';
import { cn } from '../lib/utils';
import { hapticService } from '../services/hapticService';
import { Skeleton } from '../components/ui/skeleton';

const bannerIcons: Record<string, any> = {
  LayoutGrid, Smartphone, Shirt, Home: HomeIcon, Sparkles,
  ShoppingCart, Milk, Candy, CupSoda, Apple, Watch, Backpack
};

const banners = [
  { id: 1, title: 'Summer Sale', subtitle: 'Up to 50% Off', bg: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
  { id: 2, title: 'New Arrivals', subtitle: 'Explore Latest Tech', bg: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
  { id: 3, title: 'Exclusive', subtitle: 'Members Only Deals', bg: 'bg-gradient-to-r from-amber-500 to-orange-600' },
];

export function Home() {
  const navigate = useNavigate();
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [catRes, prodRes] = await Promise.all([
        categoryService.getCategories(),
        productService.getProducts({ limit: 10 }),
      ]);
      setCategories([{ _id: 'all', name: 'All', icon: 'LayoutGrid' }, ...catRes.data]);
      setProducts(prodRes.data.products);
      if (isRefresh) hapticService.impact();
    } catch (err) {
      console.error('Failed to load home data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    (window as any)._startY = touch.screenY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const startY = (window as any)._startY || 0;
    const diff = touch.screenY - startY;

    if (diff > 150 && window.scrollY === 0) {
      fetchData(true);
    }
  };

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p: any) => {
        const catId = typeof p.category === 'object' ? p.category?._id : p.category;
        return catId === activeCategory;
      });

  return (
    <div
      className="min-h-full pb-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {refreshing && (
        <div className="absolute top-20 left-0 w-full flex justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white shadow-md rounded-full p-2"
          >
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        </div>
      )}
      <div className="bg-white pt-14 pb-4 px-6 sticky top-0 z-30 lg:pt-0 border-b border-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div onClick={() => navigate('/addresses')} className="cursor-pointer active:opacity-70 transition-opacity">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-gray-900 font-extrabold text-sm uppercase tracking-wider">Delivery in 12 mins</span>
            </div>
            <h2 className="text-gray-900 font-bold flex items-center gap-1 leading-none">
              Home — New York, USA <span className="text-blue-600 text-[10px] mt-0.5">▾</span>
            </h2>
          </div>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center relative active:scale-95 transition-transform">
              <Bell size={20} className="text-gray-700" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer active:scale-95 transition-transform border border-gray-100"
            >
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/search')}
          className="bg-gray-100/80 flex items-center px-4 py-3 rounded-2xl border border-gray-100 cursor-text group"
        >
          <Search size={20} className="text-gray-400 mr-2 group-focus-within:text-blue-600 transition-colors" />
          <span className="text-gray-400 text-sm">Search "milk", "bread" or "chips"...</span>
        </div>
      </div>

      {loading ? (
        <div className="px-6 pt-4 space-y-8">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-4 space-y-8">
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {banners.map((banner) => (
                <div key={banner.id} className="flex-[0_0_100%] min-w-0 pr-4">
                  <div className={cn("h-40 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden", banner.bg)}>
                    <div className="relative z-10">
                      <p className="text-white/80 text-sm font-medium mb-1">{banner.subtitle}</p>
                      <h3 className="text-white text-2xl font-bold mb-3">{banner.title}</h3>
                      <button className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-white/30 transition-colors w-fit">
                        Shop Now
                      </button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute right-12 -top-12 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Daily Essentials</h3>
              <button className="text-blue-600 text-sm font-semibold flex items-center gap-1">
                See all <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-6 px-6">
              {products.filter((p: any) => p.tags?.includes('dairy') || p.tags?.includes('staples')).map((product: any) => (
                <div key={product._id} className="min-w-[140px] w-[140px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Categories</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar -mx-6 px-6">
              {categories.map((cat: any) => {
                const Icon = bannerIcons[cat.icon] || LayoutGrid;
                const isActive = activeCategory === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className="flex flex-col items-center gap-2 min-w-[72px]"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                      isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" : "bg-white border border-gray-100 text-gray-600"
                    )}>
                      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium transition-colors",
                      isActive ? "text-blue-600" : "text-gray-500"
                    )}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Featured Products</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.slice(0, 8).map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
