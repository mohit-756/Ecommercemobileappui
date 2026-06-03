import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Trash2, Minus, Plus, ArrowRight, Tag, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cartItems as initialCartItems } from '../data/mock';
import { cn } from '../lib/utils';

export function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialCartItems);

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = items.length > 0 ? 15 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white pt-14 pb-4 px-6 sticky top-0 z-30 md:pt-6 md:rounded-t-[32px] border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
        <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">
          {items.length} items
        </span>
      </div>

      <div className="flex-1 px-6 py-6 pb-32 overflow-y-auto">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div 
              key={item.product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-white p-3 rounded-2xl mb-4 flex gap-4 shadow-sm border border-gray-100"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col py-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight pr-4">
                    {item.product.name}
                  </h3>
                  <button 
                    onClick={() => removeItem(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <span className="font-bold text-blue-600 mt-1">${item.product.price.toFixed(2)}</span>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center bg-gray-100 rounded-full px-1">
                    <button 
                      onClick={() => updateQuantity(idx, -1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(idx, 1)}
                      className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-900 my-0.5 mr-0.5"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500">Looks like you haven't added anything yet.</p>
          </div>
        )}

        {items.length > 0 && (
          <>
            {/* Promo Code */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Tag size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Enter promo code"
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
              />
              <button className="text-blue-600 font-semibold text-sm">Apply</button>
            </div>

            {/* Receipt Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Subtotal</span>
                <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Shipping</span>
                <span className="text-gray-900 font-medium">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Tax (Estimated)</span>
                <span className="text-gray-900 font-medium">$0.00</span>
              </div>
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Checkout Button */}
      {items.length > 0 && (
        <div className="bg-white border-t border-gray-100 p-6 md:pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] relative z-10 md:rounded-b-[32px]">
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}