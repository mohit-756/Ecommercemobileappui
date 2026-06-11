import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Bell, LayoutGrid, Apple, Cherry, ShoppingBag, Sprout, Clock, Zap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { recentlyViewedService } from '../services/recentlyViewedService';
import { ProductCard } from '../components/ProductCard';
import { LocationPermissionPopup } from '../components/LocationPermissionPopup';
import { cn } from '../lib/utils';
import { hapticService } from '../services/hapticService';
import { Skeleton } from '../components/ui/skeleton';
import { categories as mockCategories, products as mockProducts } from '../data/mock';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const bannerIcons: Record<string, any> = {
  LayoutGrid, Apple, Cherry, ShoppingBag, Sprout,
};

const banners = [
  { id: 1, title: 'Premium Dry Fruits', subtitle: 'Fresh & Organic', bg: 'bg-gradient-to-r from-amber-500 to-yellow-600' },
  { id: 2, title: 'Healthy Living', subtitle: 'Nutrition You Trust', bg: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { id: 3, title: 'Special Offers', subtitle: 'Up to 26% Off', bg: 'bg-gradient-to-r from-orange-500 to-red-600' },
];

export function Home() {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('location-popup-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShowLocationPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAllowLocation() {
    setShowLocationPopup(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {}
      );
    }
    navigate('/addresses');
  }

  function handleDismissLocation() {
    setShowLocationPopup(false);
    sessionStorage.setItem('location-popup-dismissed', 'true');
  }

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(intervalId);
  }, [emblaApi]);

  useEffect(() => {
    setRecentlyViewed(recentlyViewedService.get());
    const handler = () => setRecentlyViewed(recentlyViewedService.get());
    window.addEventListener('recently-viewed-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('recently-viewed-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  async function fetchData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        categoryService.getCategories(),
      ]);
      setProducts(productsRes.data.products || []);
      const allCategory = { id: 'all', _id: 'all', name: 'All', icon: 'LayoutGrid' };
      setCategories([allCategory, ...(categoriesRes.data || [])]);
    } catch (err) {
      console.error('Failed to fetch backend data on homepage:', err);
      setCategories(mockCategories);
      setProducts(mockProducts);
    } finally {
      if (isRefresh) hapticService.impact();
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
        const catName = categories.find((c: any) => (c._id || c.id) === activeCategory)?.name;
        return catId === activeCategory || p.category === catName || p.category === activeCategory;
      });

  return (
    <div
      className="min-h-full pb-6 transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {refreshing && (
        <div className="absolute top-20 left-0 w-full flex justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-surface shadow-md rounded-full p-2"
          >
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        </div>
      )}
      {/* Mobile Page Header (hidden on large screens) */}
      <div className="bg-white dark:bg-background pt-14 pb-4 px-6 sticky top-0 z-30 lg:hidden border-b border-gray-50 dark:border-border-light transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <div onClick={() => navigate('/addresses')} className="cursor-pointer active:opacity-70 transition-opacity">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-gray-900 dark:text-text-primary font-extrabold text-sm uppercase tracking-wider">Delivery in 12 mins</span>
            </div>
            <h2 className="text-gray-900 dark:text-text-primary font-bold flex items-center gap-1 leading-none">
              Home — Mumbai, India <span className="text-blue-600 text-[10px] mt-0.5">▾</span>
            </h2>
          </div>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full border border-gray-100 dark:border-border-light flex items-center justify-center relative active:scale-95 transition-transform">
              <Bell size={20} className="text-gray-700 dark:text-text-secondary" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface"></span>
            </button>
          </div>
        </div>

        <div
          onClick={() => navigate('/search')}
          className="bg-gray-100/80 dark:bg-surface-secondary flex items-center px-4 py-3 rounded-2xl border border-gray-100 dark:border-border-light cursor-text group"
        >
          <Search size={20} className="text-gray-400 dark:text-text-tertiary mr-2 group-focus-within:text-blue-600 transition-colors" />
          <span className="text-gray-400 dark:text-text-tertiary text-sm">Search almonds, dates, walnuts...</span>
        </div>
      </div>

      {loading ? (
        <div className="px-6 pt-4 space-y-8">
          <Skeleton className="h-40 sm:h-52 md:h-64 lg:h-72 xl:h-80 w-full rounded-2xl" />
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex gap-4 overflow-x-auto pb-2 lg:mx-0 lg:px-0 -mx-6 px-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[84px] md:min-w-[96px]">
                  <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white dark:bg-surface rounded-2xl overflow-hidden border border-gray-100 dark:border-border-light flex flex-col">
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
          <div className="relative group">
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {banners.map((banner) => (
                  <div key={banner.id} className="flex-[0_0_100%] min-w-0 pr-4">
                    <div className={cn("h-40 sm:h-52 md:h-64 lg:h-72 xl:h-80 rounded-2xl p-6 md:p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden", banner.bg)}>
                      <div className="relative z-10">
                        <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium mb-1">{banner.subtitle}</p>
                        <h3 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-5">{banner.title}</h3>
                        <button className="bg-white/20 backdrop-blur-sm text-white text-xs md:text-sm font-semibold px-4 py-2 md:px-6 md:py-3 rounded-full hover:bg-white/30 transition-colors w-fit">
                          Shop Now
                        </button>
                      </div>
                      <div className="absolute -right-8 -bottom-8 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute right-12 -top-12 w-24 h-24 md:w-36 md:h-36 bg-white/10 rounded-full blur-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => emblaApi && emblaApi.scrollPrev()}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md hover:bg-white/50 text-white rounded-full flex items-center justify-center opacity-0 lg:group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => emblaApi && emblaApi.scrollNext()}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md hover:bg-white/50 text-white rounded-full flex items-center justify-center opacity-0 lg:group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    selectedIndex === idx ? "w-6 bg-white" : "bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-text-primary text-lg">Best Sellers</h3>
              <button className="text-blue-600 text-sm font-semibold flex items-center gap-1">
                See all <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar lg:mx-0 lg:px-0 -mx-6 px-6">
              {products.slice(0, 10).map((product: any) => (
                <div key={product.id || product._id} className="flex-none w-[140px] sm:w-[150px] md:w-[160px] lg:w-[180px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {recentlyViewed.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900 dark:text-text-primary text-lg">Recently Viewed</h3>
                </div>
                <button onClick={() => { recentlyViewedService.clear(); setRecentlyViewed([]); }} className="text-blue-600 text-sm font-semibold">
                  Clear
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar lg:mx-0 lg:px-0 -mx-6 px-6">
                {recentlyViewed.slice(0, 8).map((item: any) => (
                  <div key={item.id || item._id} className="flex-none w-[120px] sm:w-[130px] md:w-[140px] lg:w-[160px]">
                    <ProductCard product={item} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-text-primary text-lg">Categories</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar lg:mx-0 lg:px-0 -mx-6 px-6">
              {categories.map((cat: any) => {
                const catId = cat._id || cat.id;
                const Icon = bannerIcons[cat.icon] || LayoutGrid;
                const isActive = activeCategory === catId;
                return (
                  <button
                    key={catId}
                    onClick={() => setActiveCategory(catId)}
                    className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[84px] md:min-w-[96px]"
                  >
                    <div className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl flex items-center justify-center transition-all duration-300",
                      isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 scale-105" : "bg-white dark:bg-surface border border-gray-100 dark:border-border-light text-gray-600 dark:text-text-secondary hover:border-gray-200 dark:hover:border-border-medium"
                    )}>
                      <Icon size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={cn(
                      "text-xs md:text-sm font-medium transition-colors",
                      isActive ? "text-blue-600" : "text-gray-500 dark:text-text-secondary"
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
              <h3 className="font-bold text-gray-900 dark:text-text-primary text-lg">Featured Products</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4 sm:gap-6">
              {filteredProducts.slice(0, 16).map((product: any) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      <LocationPermissionPopup
        open={showLocationPopup}
        onAllow={handleAllowLocation}
        onDismiss={handleDismissLocation}
      />
    </div>
  );
}
