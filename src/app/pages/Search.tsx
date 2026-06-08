import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

export function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const recentSearches = ['Milk', 'Bread', 'Amul Butter', 'Lays', 'Coke'];
  const trendingCategories = ['Dairy', 'Snacks', 'Groceries', 'Beverages', 'Fresh Fruits'];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({ search: query, limit: 20 });
        setResults(res.data.products);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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
        <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 flex-shrink-0">
          <SlidersHorizontal size={20} />
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
              <h3 className="font-bold text-gray-900 mb-4">Trending Categories</h3>
              <div className="grid grid-cols-2 gap-3">
                {trendingCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(cat)}
                    className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <SlidersHorizontal size={18} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-bold text-gray-900 mb-4">
              {loading ? 'Searching...' : `${results.length} Results for "${query}"`}
            </h3>
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
                <p className="text-gray-500">We couldn't find what you're looking for.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
