import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "../../components/Button";

const INITIAL_CART = [
  {
    id: "1",
    name: "Nike Air Max 270",
    price: 150,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3ODAzOTc4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    quantity: 1,
    size: "US 9",
    color: "Black"
  },
  {
    id: "2",
    name: "Sony Headphones",
    price: 299,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwd2lyZWxlc3N8ZW58MXx8fHwxNzgwNDczMDM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    quantity: 1,
    size: "One Size",
    color: "Silver"
  }
];

export default function CartScreen() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(INITIAL_CART);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items => items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-20">
      <div className="bg-white pt-12 pb-4 px-5 flex items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mx-auto">My Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Trash2 size={40} className="text-blue-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button onClick={() => navigate("/home")} className="w-48">Shop Now</Button>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm relative">
              <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.color} • {item.size}</p>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg text-gray-900">${item.price}</span>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-600 bg-white rounded-full shadow-sm">
                      <Minus size={14} />
                    </button>
                    <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 bg-white rounded-full shadow-sm">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {/* Promo Code */}
          <div className="bg-white rounded-2xl p-4 flex space-x-3 shadow-sm mt-6">
            <input 
              type="text" 
              placeholder="Enter promo code" 
              className="flex-1 bg-gray-50 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-black">
              Apply
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl p-5 shadow-sm mt-6 mb-20 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-semibold text-green-500">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax</span>
              <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total</span>
              <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <Button fullWidth onClick={() => navigate("/checkout")} className="mt-4 shadow-xl shadow-blue-600/30">
              Checkout <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
