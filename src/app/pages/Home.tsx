import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Bell, LayoutGrid, Apple, Cherry, ShoppingBag, Sprout, Clock, Zap, ArrowRight, ChevronLeft, ChevronRight, Leaf, Cookie } from 'lucide-react';
import { motion } from 'motion/react';
import { Geolocation } from '@capacitor/geolocation';
import useEmblaCarousel from 'embla-carousel-react';
import { useAuth } from '../contexts/AuthContext';
import { localNotificationService } from '../services/localNotificationService';
import { recentlyViewedService } from '../services/recentlyViewedService';
import { ProductCard } from '../components/ProductCard';
import { LocationPermissionPopup } from '../components/LocationPermissionPopup';
import { useDeliveryLocation } from '../contexts/LocationContext';
import { cn } from '../lib/utils';
import { hapticService } from '../services/hapticService';
import { Skeleton } from '../components/ui/skeleton';
import { categories as mockCategories, products as mockProducts } from '../data/mock';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { IMAGE_BASE_URL } from '../services/api';

const bannerIcons: Record<string, any> = {
  LayoutGrid, Apple, Cherry, ShoppingBag, Sprout, Leaf, Cookie,
};

const banners = [
  {
    id: 1,
    title: 'Premium Dry Fruits',
    subtitle: 'Fresh & Organic',
    description: '100% natural, handpicked walnuts, almonds, and cashews sourced from organic farms.',
    bg: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400',
    image: '/images/promo/mixed_nuts.png',
  },
  {
    id: 2,
    title: 'Healthy Living',
    subtitle: 'Nutrition You Trust',
    description: 'Boost your immunity and energy with our premium selected superfoods and cardamoms.',
    bg: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400',
    image: '/images/promo/healthy_lifestyle.png',
  },
  {
    id: 3,
    title: 'Exclusive Gifting',
    subtitle: 'Special Offers',
    description: 'Share health and happiness. Enjoy up to 25% off on our luxury dry fruit gift boxes.',
    bg: 'bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400',
    image: '/images/promo/gift_box.png',
  },
];

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deliveryLocation, setShowSelector, detectLocation } = useDeliveryLocation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
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

  async function handleAllowLocation() {
    setShowLocationPopup(false);
    sessionStorage.setItem('location-popup-dismissed', 'true');
    detectLocation();
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
      const sortedCats = (categoriesRes.data || []).sort((a: any, b: any) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
      );
      setCategories([allCategory, ...sortedCats]);
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

  const finalFilteredProducts = filteredProducts.filter((p: any) => {
    if (activeFilter === 'top_rated') return (p.rating || 5) >= 4.5;
    if (activeFilter === 'discounts') return p.discount || (p.originalPrice && p.originalPrice > p.price);
    if (activeFilter === 'under_500') return p.price < 500;
    return true;
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
      <div className="bg-white dark:bg-background pt-4 pb-3 px-6 sticky top-0 z-30 lg:hidden border-b border-gray-50 dark:border-border-light transition-colors duration-300">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5 leading-none">
              {user ? `Hi, ${user.name.split(' ')[0]} 👋` : 'Welcome to Dry Fruit Hub 🍎'}
            </span>
            <div 
              onClick={() => setShowSelector(true)} 
              className="cursor-pointer mt-1.5 group"
            >
              <h2 className="text-gray-900 dark:text-text-primary font-black text-sm sm:text-base flex items-center gap-1 leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Home — {deliveryLocation} <span className="text-blue-600 text-[10px] mt-0.5 group-hover:translate-y-0.5 transition-transform">▾</span>
              </h2>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ rotate: [0, -12, 12, -12, 12, 0], scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticService.impact(); localNotificationService.sendWelcomeNotification(); }}
              className="w-10 h-10 rounded-full border border-gray-100 dark:border-border-light flex items-center justify-center relative transition-colors bg-white dark:bg-surface cursor-pointer"
            >
              <Bell size={20} className="text-gray-700 dark:text-text-secondary" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface"></span>
            </motion.button>
          </div>
        </div>

        <div
          onClick={() => navigate('/search')}
          className="bg-gray-100/60 hover:bg-gray-100/80 dark:bg-surface-secondary/70 flex items-center px-4 py-2.5 rounded-xl border border-gray-100/50 dark:border-border-light/50 cursor-text active:scale-[0.99] hover:border-blue-500/20 dark:hover:border-blue-500/30 transition-all duration-200 group shadow-sm"
        >
          <Search size={18} className="text-gray-400 dark:text-text-tertiary mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="text-gray-400 dark:text-text-tertiary text-xs sm:text-sm">Search almonds, dates, walnuts...</span>
        </div>
      </div>

      {loading ? (
        <div className="px-6 pt-2 space-y-8">
          <Skeleton className="h-40 sm:h-52 md:h-64 lg:h-72 xl:h-80 -mx-6 lg:mx-0 w-auto rounded-none lg:rounded-2xl" />
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
        <div className="px-6 pt-2 space-y-8">
          <div className="relative group -mx-6 lg:mx-0">
            <div className="overflow-hidden lg:rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {banners.map((banner) => (
                  <div key={banner.id} className="w-full shrink-0">
                    <div className={cn("h-48 sm:h-60 md:h-72 lg:h-80 p-6 md:p-10 lg:p-12 flex items-center justify-between relative overflow-hidden rounded-none lg:rounded-2xl", banner.bg)}>
                      <div className="relative z-10 max-w-[60%] flex flex-col justify-center h-full">
                        <p className="text-white/80 text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-widest mb-1.5">{banner.subtitle}</p>
                        <h3 className="text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 leading-tight">{banner.title}</h3>
                        <p className="text-white/90 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 line-clamp-2 hidden sm:block font-medium max-w-md">{banner.description}</p>
                        <button 
                          onClick={() => {
                            hapticService.impact();
                            if (banner.id === 1) navigate('/search?q=Dried Fruits');
                            else if (banner.id === 2) navigate('/search?q=Nuts');
                            else if (banner.id === 3) navigate('/search?q=Mixed');
                            else navigate('/search');
                          }}
                          className="bg-white text-gray-900 shadow-lg shadow-black/10 text-xs md:text-sm font-bold px-5 py-2.5 md:px-7 md:py-3 rounded-full hover:bg-gray-50 active:scale-95 transition-all w-fit cursor-pointer"
                        >
                          Shop Now
                        </button>
                      </div>
                      <div className="absolute right-0 bottom-0 top-0 w-[45%] flex items-center justify-end z-10 pointer-events-none p-4">
                        <img 
                          src={`${IMAGE_BASE_URL}${banner.image}`} 
                          alt={banner.title} 
                          className="h-[85%] md:h-[95%] w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)] animate-float"
                        />
                      </div>
                      {/* Decorative background blurs */}
                      <div className="absolute -right-8 -bottom-8 w-40 h-40 md:w-60 md:h-60 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="absolute right-24 -top-12 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-2xl"></div>
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

          {/* Categories Section (Positioned directly below Banner) */}
          <div className="z-20 relative animate-fade-in">
            <div className="flex justify-between items-center mb-4 hidden lg:flex">
              <h3 className="font-bold text-gray-900 dark:text-text-primary text-lg">Categories</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar lg:mx-0 lg:px-0 -mx-6 px-6">
              {categories.map((cat: any) => {
                const catId = cat._id || cat.id;
                const Icon = bannerIcons[cat.icon] || LayoutGrid;
                const isActive = activeCategory === catId;
                return (
                  <motion.button
                    key={catId}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { hapticService.selection(); setActiveCategory(catId); }}
                    className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[84px] md:min-w-[96px] cursor-pointer"
                  >
                    <div className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl flex items-center justify-center transition-all duration-300",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30" 
                        : "bg-white dark:bg-surface border border-gray-100 dark:border-border-light text-gray-600 dark:text-text-secondary shadow-md shadow-black/5 hover:border-gray-200 dark:hover:border-border-medium"
                    )}>
                      <Icon size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={cn(
                      "text-xs md:text-sm font-semibold transition-colors",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-text-secondary"
                    )}>
                      {cat.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-text-primary text-lg">
                {activeCategory === 'all' ? 'Best Sellers' : `Best Sellers in ${categories.find(c => (c._id || c.id) === activeCategory)?.name || ''}`}
              </h3>
              <button 
                onClick={() => {
                  hapticService.impact();
                  const catName = categories.find((c: any) => (c._id || c.id) === activeCategory)?.name;
                  if (activeCategory !== 'all' && catName) {
                    navigate(`/search?q=${encodeURIComponent(catName)}`);
                  } else {
                    navigate('/search');
                  }
                }}
                className="text-blue-600 text-sm font-semibold flex items-center gap-1 cursor-pointer hover:underline"
              >
                See all <ArrowRight size={14} />
              </button>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50/50 dark:bg-surface-secondary/50 rounded-2xl border border-dashed border-gray-200 dark:border-border-medium/60 w-full">
                <p className="text-sm text-gray-500 dark:text-text-secondary">No products found in this category.</p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar lg:mx-0 lg:px-0 -mx-6 px-6">
                {filteredProducts.slice(0, 10).map((product: any) => (
                  <div key={product.id || product._id} className="flex-none w-[140px] sm:w-[150px] md:w-[160px] lg:w-[180px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
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

          {/* Categories section moved from here */}

          <div>
            <div className="flex flex-col gap-3 mb-4">
              <h3 className="font-bold text-gray-900 dark:text-text-primary text-lg">Featured Products</h3>
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-6 px-6">
                {[
                  { id: 'all', label: '🔥 All Items' },
                  { id: 'top_rated', label: '⭐ Top Rated' },
                  { id: 'discounts', label: '💰 Best Discounts' },
                  { id: 'under_500', label: '💸 Under ₹500' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => { hapticService.selection(); setActiveFilter(filter.id); }}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-200 active:scale-95",
                      activeFilter === filter.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                        : "bg-white dark:bg-surface border-gray-100 dark:border-border-light text-gray-600 dark:text-text-secondary hover:border-gray-200 dark:hover:border-border-medium"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            {finalFilteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-gray-55/50 dark:bg-surface-secondary/50 rounded-2xl border border-dashed border-gray-200 dark:border-border-medium/60">
                <p className="text-sm text-gray-500 dark:text-text-secondary">No products match the selected criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4 sm:gap-6">
                {finalFilteredProducts.slice(0, 16).map((product: any) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            )}
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
