import { useNavigate } from "react-router";
import { ArrowLeft, Search as SearchIcon, Filter, X } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "../../components/ProductCard";

const RECENT_SEARCHES = ["Nike Air Max", "Wireless Headphones", "Smart Watch"];
const POPULAR_SEARCHES = ["iPhone 14", "Running Shoes", "Gaming Laptop", "Sneakers", "T-Shirts"];

export default function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Mock results for UI display
  const RESULTS = [
    {
      id: "1",
      name: "Nike Air Max 270",
      price: 150,
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3ODAzOTc4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    }
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-surface min-h-full pb-20 transition-colors duration-300">
      <div className="pt-12 pb-4 px-5 border-b border-gray-100 dark:border-border-light sticky top-0 bg-white dark:bg-surface z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-text-primary">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSearching(e.target.value.length > 0);
              }}
              className="w-full h-12 bg-gray-50 dark:bg-background rounded-xl pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
            />
            {query && (
              <button onClick={() => { setQuery(""); setIsSearching(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary bg-gray-200 dark:bg-border-medium rounded-full p-0.5">
                <X size={14} />
              </button>
            )}
          </div>
          <button className="w-12 h-12 bg-gray-50 dark:bg-background rounded-xl flex items-center justify-center text-gray-900 dark:text-text-primary">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {!isSearching ? (
        <div className="p-5 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-900 dark:text-text-primary text-sm">Recent Searches</h3>
              <button className="text-xs text-blue-600 font-medium">Clear All</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {RECENT_SEARCHES.map((item, i) => (
                <button key={i} onClick={() => { setQuery(item); setIsSearching(true); }} className="px-4 py-2 bg-gray-50 dark:bg-background rounded-full text-xs font-medium text-gray-700 dark:text-text-primary flex items-center">
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-text-primary text-sm mb-3">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((item, i) => (
                <button key={i} onClick={() => { setQuery(item); setIsSearching(true); }} className="px-4 py-2 border border-gray-200 dark:border-border-medium rounded-full text-xs font-medium text-gray-700 dark:text-text-primary hover:border-blue-600 hover:text-blue-600 transition-colors">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <p className="text-sm text-gray-500 dark:text-text-secondary mb-4">Found {RESULTS.length} results for "{query}"</p>
          <div className="grid grid-cols-2 gap-4">
            {RESULTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
