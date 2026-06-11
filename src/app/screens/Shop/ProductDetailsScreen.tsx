import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Heart, Share2, Star, ShoppingBag, Truck, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "../../components/Button";

const PRODUCT = {
  id: "1",
  name: "Nike Air Max 270",
  price: 150,
  originalPrice: 180,
  rating: 4.8,
  reviews: 124,
  description: "The Nike Air Max 270 delivers visible Air under every step. Updated for modern comfort, it nods to the original 1991 Air Max 180 with its exaggerated tongue top and heritage tongue logo.",
  images: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3ODAzOTc4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9lc3xlbnwxfHx8fDE3ODA0NzUzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  ],
  sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
  colors: ["bg-black", "bg-red-500", "bg-blue-500"]
};

export default function ProductDetailsScreen() {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(PRODUCT.sizes[2]);
  const [selectedColor, setSelectedColor] = useState(PRODUCT.colors[0]);

  return (
    <div className="flex flex-col bg-white dark:bg-surface h-full relative transition-colors duration-300">
      {/* Header */}
      <div className="absolute top-0 w-full p-5 flex justify-between items-center z-10 pt-12">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/80 dark:bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div className="flex space-x-3">
          <button className="w-10 h-10 bg-white/80 dark:bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary shadow-sm">
            <Share2 size={20} />
          </button>
          <button className="w-10 h-10 bg-white/80 dark:bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary shadow-sm">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
        {/* Image Gallery */}
        <div className="bg-gray-100 dark:bg-surface-tertiary h-96 relative">
          <img src={PRODUCT.images[activeImage]} alt={PRODUCT.name} className="w-full h-full object-cover mix-blend-multiply pt-10" />
          <div className="absolute bottom-4 w-full flex justify-center space-x-2">
            {PRODUCT.images.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(i)}
                className={`w-2 h-2 rounded-full transition-all ${activeImage === i ? "w-6 bg-blue-600" : "bg-gray-300 dark:bg-border-medium"}`} 
              />
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-500/20 px-2 py-1 rounded-md text-xs font-bold">
              <Star size={12} className="fill-amber-500 mr-1" />
              {PRODUCT.rating}
            </div>
            <span className="text-gray-400 dark:text-text-tertiary text-xs">({PRODUCT.reviews} Reviews)</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">{PRODUCT.name}</h1>
          <div className="flex items-end space-x-3 mb-6">
            <span className="text-3xl font-bold text-gray-900 dark:text-text-primary">${PRODUCT.price}</span>
            {PRODUCT.originalPrice && (
              <span className="text-lg text-gray-400 dark:text-text-tertiary line-through mb-1">${PRODUCT.originalPrice}</span>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-text-primary mb-3">Color</h3>
            <div className="flex space-x-3">
              {PRODUCT.colors.map((color, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${selectedColor === color ? "border-blue-600" : "border-transparent"}`}
                >
                  <div className={`w-8 h-8 rounded-full ${color}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-text-primary">Size</h3>
              <button className="text-sm text-blue-600 font-medium">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {PRODUCT.sizes.map((size, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${selectedSize === size ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 dark:border-border-medium text-gray-700 dark:text-text-secondary hover:border-gray-300 dark:hover:border-border-medium"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-text-primary mb-2">Description</h3>
            <p className="text-gray-500 dark:text-text-secondary text-sm leading-relaxed">{PRODUCT.description}</p>
          </div>

          <div className="bg-gray-50 dark:bg-surface-secondary rounded-2xl p-4 space-y-3 mb-6">
            <div className="flex items-center text-sm font-medium text-gray-700 dark:text-text-secondary">
              <Truck size={18} className="text-blue-600 mr-3" /> Free Delivery & Returns
            </div>
            <div className="flex items-center text-sm font-medium text-gray-700 dark:text-text-secondary">
              <ShieldCheck size={18} className="text-blue-600 mr-3" /> 100% Authentic Guaranteed
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 w-full bg-white dark:bg-surface border-t border-gray-100 dark:border-border-light p-5 pb-safe grid grid-cols-2 gap-4 transition-colors duration-300">
        <Button variant="outline" className="flex items-center justify-center space-x-2" onClick={() => navigate("/cart")}>
          <ShoppingBag size={20} />
          <span>Add to Cart</span>
        </Button>
        <Button onClick={() => navigate("/checkout")}>
          Buy Now
        </Button>
      </div>
    </div>
  );
}
