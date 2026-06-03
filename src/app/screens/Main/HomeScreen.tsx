import { Search, Bell, Grid, Zap, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import { ProductCard } from "../../components/ProductCard";

const CATEGORIES = [
  { id: 1, name: "Fashion", icon: "👗", color: "bg-pink-100" },
  { id: 2, name: "Electronics", icon: "💻", color: "bg-blue-100" },
  { id: 3, name: "Shoes", icon: "👟", color: "bg-orange-100" },
  { id: 4, name: "Beauty", icon: "💄", color: "bg-rose-100" },
  { id: 5, name: "Furniture", icon: "🛋️", color: "bg-emerald-100" },
];

const PRODUCTS = [
  {
    id: "1",
    name: "Nike Air Max 270",
    price: 150,
    originalPrice: 180,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3ODAzOTc4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    discount: 16
  },
  {
    id: "2",
    name: "Sony Noise Cancelling Headphones",
    price: 299,
    rating: 4.9,
    reviews: 840,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwd2lyZWxlc3N8ZW58MXx8fHwxNzgwNDczMDM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "3",
    name: "Apple Watch Series 8",
    price: 399,
    originalPrice: 429,
    rating: 4.7,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHdhdGNoJTIwbW9kZXJufGVufDF8fHx8MTc4MDM0ODI1NXww&ixlib=rb-4.1.0&q=80&w=1080",
    discount: 7
  },
  {
    id: "4",
    name: "iPhone 14 Pro Max",
    price: 1099,
    rating: 5.0,
    reviews: 2310,
    image: "https://images.unsplash.com/photo-1634403665481-74948d815f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9kZXJuJTIwaXNvbGF0ZWR8ZW58MXx8fHwxNzgwNDczMDM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  }
];

export default function HomeScreen() {
  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-5 rounded-b-3xl shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-5">
          <div>
            <p className="text-sm text-gray-500 font-medium">Deliver to</p>
            <div className="flex items-center text-gray-900 font-bold">
              New York, USA <span className="ml-1 text-[10px]">▼</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link to="/notifications" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center relative">
              <Bell size={20} className="text-gray-700" />
              <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </Link>
          </div>
        </div>

        <Link to="/search" className="flex items-center bg-gray-100 rounded-2xl h-12 px-4 text-gray-400">
          <Search size={20} />
          <span className="ml-3 text-sm">Search for products...</span>
        </Link>
      </div>

      <div className="px-5 py-6 space-y-8">
        {/* Promo Banner */}
        <div className="relative rounded-3xl overflow-hidden h-40 shadow-lg">
          <img src="https://images.unsplash.com/photo-1539278383962-a7774385fa02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBiYW5uZXIlMjBmYXNoaW9ufGVufDF8fHx8MTc4MDQ3MzAzOHww&ixlib=rb-4.1.0&q=80&w=1080" alt="Promo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-6">
            <h2 className="text-white text-2xl font-bold w-1/2 leading-tight">Summer Sale is Live!</h2>
            <p className="text-white/80 text-sm mt-1 mb-3">Up to 50% OFF</p>
            <button className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-full w-max">
              Shop Now
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Categories</h3>
            <Link to="/products" className="text-blue-600 text-sm font-medium">See All</Link>
          </div>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="flex flex-col items-center space-y-2 min-w-[64px]">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${cat.color}`}>
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-lg flex items-center">
              <Zap className="mr-2 text-amber-500 fill-amber-500" size={18} />
              Flash Sale
            </h3>
            <div className="flex items-center space-x-1 text-xs font-bold">
              <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded">02</span>:
              <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded">45</span>:
              <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded">30</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {PRODUCTS.slice(0, 2).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        
        {/* Trending Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-lg flex items-center">
              <TrendingUp className="mr-2 text-blue-600" size={18} />
              Trending Now
            </h3>
            <Link to="/products" className="text-blue-600 text-sm font-medium">See All</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 pb-4">
            {PRODUCTS.slice(2, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
