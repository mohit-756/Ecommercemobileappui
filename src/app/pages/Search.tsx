import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router';
import { ChevronLeft, Search as SearchIcon, X, SlidersHorizontal, ChevronDown, Star, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { cn } from '../lib/utils';
import { products as mockProducts, categories as mockCategories } from '../data/mock';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];

export function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const setQuery = (newVal: string) => {
    if (newVal) {
      setSearchParams({ q: newVal }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const recentSearches = ['Almonds', 'Cashews', 'Dates', 'Walnuts', 'Raisins'];

  useEffect(() => {
    categoryService.getCategories()
      .then((res) => {
        const sorted = (res.data || []).sort((a: any, b: any) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
        );
        setCategories(sorted);
      })
      .catch((err) => {
        console.error('Failed to load categories in search:', err);
        setCategories(mockCategories);
      });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params: any = {
          search: query,
        };
        if (sort) params.sort = sort;
        if (minPrice) params.minPrice = Number(minPrice);
        if (maxPrice) params.maxPrice = Number(maxPrice);
        if (categoryFilter) params.category = categoryFilter;

        const res = await productService.getProducts(params);
        setResults(res.data.products || []);
      } catch (err) {
        console.error('Failed to search products in backend:', err);
        const filtered = mockProducts.filter((p: any) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, sort, minPrice, maxPrice, categoryFilter]);

  const activeFilterCount = [sort, minPrice, maxPrice, categoryFilter].filter(Boolean).length;

  const clearFilters = () => {
    setSort('');
    setMinPrice('');
    setMaxPrice('');
    setCategoryFilter('');
  };

  return (
    <div className="min-h-full flex flex-col bg-white dark:bg-surface transition-colors duration-300">
      <div className="pt-12 pb-4 px-6 sticky top-0 z-30 bg-white dark:bg-surface lg:pt-4 lg:pb-4 border-b border-gray-100 dark:border-border-light flex items-center gap-3 transition-colors duration-300">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary flex-shrink-0 lg:hidden"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 relative lg:hidden">
          <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-gray-100 dark:bg-surface-tertiary border-transparent text-gray-900 dark:text-text-primary rounded-xl py-2.5 pl-10 pr-10 focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-surface outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary hover:text-gray-600 dark:hover:text-text-secondary"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Desktop Header Title */}
        <h1 className="hidden lg:block text-2xl font-black text-gray-900 dark:text-text-primary flex-1">Search Results</h1>

        <button
          onClick={() => setShowFilters(true)}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative transition-colors lg:w-auto lg:px-4 lg:gap-2",
            activeFilterCount > 0 ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-surface-tertiary text-gray-700 dark:text-text-primary"
          )}
        >
          <SlidersHorizontal size={20} />
          <span className="hidden lg:inline font-semibold text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto bg-gray-50 dark:bg-surface-secondary transition-colors duration-300">
        {!query ? (
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-text-primary">Recent Searches</h3>
                <button className="text-gray-400 dark:text-text-tertiary text-sm">Clear All</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(search)}
                    className="bg-white dark:bg-surface border border-gray-200 dark:border-border-medium text-gray-600 dark:text-text-secondary text-sm px-4 py-2 rounded-full hover:border-blue-600 hover:text-blue-600 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-text-primary mb-4">Browse Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: any) => (
                  <button
                    key={cat._id || cat.id}
                    onClick={() => { setCategoryFilter(cat._id || cat.id); setQuery(cat.name); }}
                    className="bg-white dark:bg-surface border border-gray-200 dark:border-border-medium text-gray-600 dark:text-text-secondary text-sm px-4 py-2 rounded-full hover:border-blue-600 hover:text-blue-600 transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-text-primary">
                {loading ? 'Searching...' : `${results.length} Result${results.length !== 1 ? 's' : ''} for "${query}"`}
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-blue-600 font-medium">Clear filters</button>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4 sm:gap-6">
                {results.map((product: any) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon size={48} className="mx-auto text-gray-300 dark:text-text-tertiary mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-text-primary mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-text-secondary">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showFilters && createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.9 }}
              className="relative bg-white dark:bg-surface w-full sm:max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] transition-colors duration-300"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-border-light">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-text-primary tracking-tight">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="flex-1 max-w-fit flex items-center justify-end gap-1.5 text-blue-600 text-sm font-semibold hover:text-blue-700 active:scale-95 transition-all"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>

              <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-5 space-y-5">
                <div className="bg-gray-50/80 dark:bg-surface-secondary rounded-2xl p-5 border border-gray-100 dark:border-border-light">
                  <label className="text-sm font-bold text-gray-900 dark:text-text-primary block mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full" />
                    Sort By
                  </label>
                  <div className="space-y-2">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                            sort === opt.value
                              ? "bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                              : "bg-white dark:bg-surface text-gray-600 dark:text-text-secondary border border-gray-200 dark:border-border-medium hover:border-blue-300 hover:text-blue-600"
                        )}
                      >
                        <span>{opt.label}</span>
                        {sort === opt.value && (
                          <Check size={16} strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50/80 dark:bg-surface-secondary rounded-2xl p-5 border border-gray-100 dark:border-border-light">
                  <label className="text-sm font-bold text-gray-900 dark:text-text-primary block mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full" />
                    Price Range
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary text-sm font-medium">₹</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-white dark:bg-surface border border-gray-200 dark:border-border-medium rounded-xl pl-8 pr-4 py-3 text-sm text-gray-900 dark:text-text-primary outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all hide-scrollbar"
                      />
                    </div>
                    <div className="w-3 h-px bg-gray-300 dark:bg-border-medium" />
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary text-sm font-medium">₹</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-white dark:bg-surface border border-gray-200 dark:border-border-medium rounded-xl pl-8 pr-4 py-3 text-sm text-gray-900 dark:text-text-primary outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all hide-scrollbar"
                      />
                    </div>
                  </div>
                  <div className="mt-3 px-1">
                    <div className="h-1.5 bg-gray-200 dark:bg-border-medium rounded-full relative">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{
                           left: `${minPrice ? Math.min(Number(minPrice) / 50, 100) : 0}%`,
                           right: `${maxPrice ? 100 - Math.min(Number(maxPrice) / 50, 100) : 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-gray-400 dark:text-text-tertiary font-medium">₹0</span>
                      <span className="text-[10px] text-gray-400 dark:text-text-tertiary font-medium">₹5000+</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/80 dark:bg-surface-secondary rounded-2xl p-5 border border-gray-100 dark:border-border-light">
                  <label className="text-sm font-bold text-gray-900 dark:text-text-primary block mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full" />
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategoryFilter('')}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        !categoryFilter
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                          : "bg-white dark:bg-surface text-gray-600 dark:text-text-secondary border border-gray-200 dark:border-border-medium hover:border-blue-300 hover:text-blue-600"
                      )}
                    >
                      All
                    </button>
                    {categories.map((cat: any) => (
                      <button
                        key={cat._id || cat.id}
                        onClick={() => setCategoryFilter(cat._id || cat.id)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                          categoryFilter === (cat._id || cat.id)
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                            : "bg-white dark:bg-surface text-gray-600 dark:text-text-secondary border border-gray-200 dark:border-border-medium hover:border-blue-300 hover:text-blue-600"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-surface border-t border-gray-100 dark:border-border-light px-6 py-4 pb-6 sm:pb-4 transition-colors duration-300">
                <div className="flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-gray-100 dark:bg-surface-tertiary text-gray-700 dark:text-text-primary font-semibold rounded-2xl py-3.5 hover:bg-gray-200 dark:hover:bg-surface-secondary active:scale-[0.98] transition-all duration-200 text-sm"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl py-3.5 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-200/60 dark:hover:shadow-blue-900/30 active:scale-[0.98] transition-all duration-200 text-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}
