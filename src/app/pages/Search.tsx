import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Search as SearchIcon, X, SlidersHorizontal, ChevronDown, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductCard } from '../components/ProductCard';
import { cn } from '../lib/utils';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];

export function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
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
    categoryService.getCategories().then((res) => {
      setCategories(res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params: any = { search: query, limit: 20 };
        if (sort) params.sort = sort;
        if (minPrice) params.minPrice = Number(minPrice);
        if (maxPrice) params.maxPrice = Number(maxPrice);
        if (categoryFilter) params.category = categoryFilter;

        const res = await productService.getProducts(params);
        setResults(res.data.products);
      } catch {
        setResults([]);
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
    <div className="min-h-full flex flex-col bg-white">
      <div className="pt-12 pb-4 px-6 sticky top-0 z-30 bg-white lg:pt-0 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 flex-shrink-0"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 relative">
          <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-gray-100 border-transparent text-gray-900 rounded-xl py-2.5 pl-10 pr-10 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative transition-colors",
            activeFilterCount > 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
          )}
        >
          <SlidersHorizontal size={20} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto bg-gray-50">
        {!query ? (
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Recent Searches</h3>
                <button className="text-gray-400 text-sm">Clear All</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(search)}
                    className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full hover:border-blue-600 hover:text-blue-600 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Browse Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: any) => (
                  <button
                    key={cat._id}
                    onClick={() => { setCategoryFilter(cat._id); setQuery(cat.name); }}
                    className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full hover:border-blue-600 hover:text-blue-600 transition-colors"
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
              <h3 className="font-bold text-gray-900">
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {results.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 pb-10 shadow-2xl overflow-hidden"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button onClick={clearFilters} className="text-blue-600 text-sm font-bold">Clear All</button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-3">Sort By</label>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
                          sort === opt.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-200 text-gray-600 hover:border-blue-300"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-3">Price Range</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-3">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategoryFilter('')}
                      className={cn(
                        "px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
                        !categoryFilter
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-blue-300"
                      )}
                    >
                      All
                    </button>
                    {categories.map((cat: any) => (
                      <button
                        key={cat._id}
                        onClick={() => setCategoryFilter(cat._id)}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
                          categoryFilter === cat._id
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-200 text-gray-600 hover:border-blue-300"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 bg-gray-900 text-white font-semibold rounded-xl py-3.5"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
