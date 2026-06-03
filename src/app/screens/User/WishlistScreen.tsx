import { useNavigate } from "react-router";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { ProductCard } from "../../components/ProductCard";

const PRODUCTS = [
  { id: "1", name: "Nike Air Max", price: 150, rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3ODAzOTc4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: "2", name: "Sony Headphones", price: 299, rating: 4.9, reviews: 840, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwd2lyZWxlc3N8ZW58MXx8fHwxNzgwNDczMDM4fDA&ixlib=rb-4.1.0&q=80&w=1080" }
];

export default function WishlistScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-safe">
      <div className="bg-white pt-12 pb-4 px-5 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mx-auto pr-6">My Wishlist</h1>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {PRODUCTS.map(product => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <button className="absolute top-2 right-2 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center z-10">
                <Trash2 size={16} />
              </button>
              <button className="absolute bottom-16 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center z-10 shadow-md">
                <ShoppingBag size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
