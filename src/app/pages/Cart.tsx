import { useNavigate } from 'react-router';
import { Trash2, Minus, Plus, ArrowRight, Tag, ShoppingCart, BellOff, DoorOpen, UserCheck, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';

export function Cart() {
  const navigate = useNavigate();
  const { items, itemCount, loading, updateQuantity, removeItem, subtotal } = useCart();
  const shipping = items.length > 0 ? (subtotal >= 500 ? 0 : 40) : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-14 pb-4 px-6 sticky top-0 z-30 lg:pt-0 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
        <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">
          {itemCount} items
        </span>
      </div>

      <div className="flex-1 px-6 py-6 pb-32 lg:pb-6 overflow-y-auto">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-white p-3 rounded-2xl mb-4 flex gap-4 shadow-sm border border-gray-100"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.product.image || item.product.images?.[0] || ''} alt={item.product.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 flex flex-col py-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight pr-4">
                    {item.product.name}
                  </h3>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <span className="font-bold text-blue-600 mt-1">${(item.product.price || 0).toFixed(2)}</span>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center bg-gray-100 rounded-full px-1">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
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
            <button
              onClick={() => navigate('/home')}
              className="mt-6 bg-blue-600 text-white font-semibold rounded-xl py-3 px-8 hover:bg-blue-700 transition-colors"
            >
              Shop Now
            </button>
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 mb-4">
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

            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 px-1">Delivery Instructions</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {[
                  { id: '1', label: 'Don\'t ring bell', icon: 'BellOff' },
                  { id: '2', label: 'Leave at gate', icon: 'DoorOpen' },
                  { id: '3', label: 'Leave with guard', icon: 'UserCheck' },
                  { id: '4', label: 'Avoid calling', icon: 'PhoneOff' },
                ].map((inst) => (
                  <button
                    key={inst.id}
                    className="flex flex-col items-center justify-center min-w-[100px] bg-white border border-gray-100 p-3 rounded-2xl active:border-blue-600 active:text-blue-600 transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-600 text-center">{inst.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Subtotal</span>
                <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Shipping</span>
                <span className="text-gray-900 font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
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

        {items.length > 0 && (
        <div className="bg-white border-t border-gray-100 p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] relative z-10">
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
