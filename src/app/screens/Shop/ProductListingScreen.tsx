import { useNavigate } from "react-router";
import { ArrowLeft, Filter, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "../../components/ProductCard";

const PRODUCTS = [
  { id: "1", name: "Nike Air Max", price: 150, rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3ODAzOTc4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: "2", name: "Sony Headphones", price: 299, rating: 4.9, reviews: 840, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwd2lyZWxlc3N8ZW58MXx8fHwxNzgwNDczMDM4fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: "3", name: "Apple Watch", price: 399, rating: 4.7, reviews: 56, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHdhdGNoJTIwbW9kZXJufGVufDF8fHx8MTc4MDM0ODI1NXww&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: "4", name: "iPhone 14 Pro", price: 1099, rating: 5.0, reviews: 2310, image: "https://images.unsplash.com/photo-1634403665481-74948d815f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9kZXJuJTIwaXNvbGF0ZWR8ZW58MXx8fHwxNzgwNDczMDM4fDA&ixlib=rb-4.1.0&q=80&w=1080" }
];

export default function ProductListingScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-background min-h-full pb-safe transition-colors duration-300">
      <div className="bg-white dark:bg-surface pt-12 pb-4 px-5 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary mx-auto">Products</h1>
        <div className="flex space-x-2">
          <button className="w-10 h-10 bg-gray-50 dark:bg-background rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary">
            <SlidersHorizontal size={18} />
          </button>
          <button className="w-10 h-10 bg-gray-50 dark:bg-background rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {["All", "Shoes", "Electronics", "Fashion", "Watches"].map((cat, i) => (
            <button key={i} className={`px-5 py-2 rounded-full text-sm font-medium flex-shrink-0 ${i === 0 ? "bg-blue-600 text-white" : "bg-white dark:bg-surface text-gray-600 dark:text-text-secondary border border-gray-200 dark:border-border-medium"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {PRODUCTS.map(product => (
            <ProductCard key={product.id + "copy"} product={{...product, id: product.id+"copy"}} />
          ))}
        </div>
      </div>
    </div>
  );
}
