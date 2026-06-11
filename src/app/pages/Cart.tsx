import { useNavigate } from 'react-router';
import { Trash2, Minus, Plus, ArrowRight, Tag, ShoppingCart, BellOff, DoorOpen, UserCheck, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../lib/utils';
import { useTranslation } from '../hooks/useTranslation';

export function Cart() {
  const navigate = useNavigate();
  const { items, itemCount, loading, updateQuantity, removeItem, subtotal } = useCart();
  const { t } = useTranslation();
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
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-background transition-colors duration-300 lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none lg:bg-transparent overflow-hidden">
      <div className="bg-white dark:bg-surface transition-colors duration-300 pt-14 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 dark:border-border-light flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary">{t('myCart')}</h1>
        <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">
          {itemCount} {t('items')}
        </span>
      </div>

      <div className="flex-1 px-6 py-6 pb-32 lg:pb-6 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-surface-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={40} className="text-gray-400 dark:text-text-tertiary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary mb-2">{t('cartEmpty')}</h2>
            <p className="text-gray-500 dark:text-text-secondary">{t('cartEmptyDesc')}</p>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 bg-blue-600 text-white font-semibold rounded-xl py-3 px-8 hover:bg-blue-700 transition-colors"
            >
              {t('shopNow')}
            </button>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">
            {/* Left Column - items and delivery instructions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="bg-white dark:bg-surface transition-colors duration-300 p-3 rounded-2xl flex gap-4 shadow-sm border border-gray-100 dark:border-border-light"
                    >
                      <div className="w-24 h-24 bg-gray-100 dark:bg-surface-tertiary rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.product.image || item.product.images?.[0] || ''} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 flex flex-col py-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 dark:text-text-primary text-sm line-clamp-2 leading-tight pr-4">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-gray-400 dark:text-text-tertiary hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <span className="font-bold text-blue-600 mt-1">{formatPrice(item.product.price || 0)}</span>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center bg-gray-100 dark:bg-surface-tertiary rounded-full px-1">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-text-secondary"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-gray-900 dark:text-text-primary">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-7 h-7 bg-white dark:bg-surface transition-colors duration-300 rounded-full shadow-sm flex items-center justify-center text-gray-900 dark:text-text-primary my-0.5 mr-0.5"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-text-primary mb-3 px-1">{t('deliveryInstructions')}</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {[
                    { id: '1', labelKey: 'dontRingBell', icon: 'BellOff' },
                    { id: '2', labelKey: 'leaveAtGate', icon: 'DoorOpen' },
                    { id: '3', labelKey: 'leaveWithGuard', icon: 'UserCheck' },
                    { id: '4', labelKey: 'avoidCalling', icon: 'PhoneOff' },
                  ].map((inst) => (
                    <button
                      key={inst.id}
                      className="flex flex-col items-center justify-center min-w-[120px] bg-white dark:bg-surface border border-gray-100 dark:border-border-light p-4 rounded-2xl active:border-blue-600 active:text-blue-600 hover:border-blue-300 transition-colors duration-300 cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-gray-600 dark:text-text-secondary text-center">{t(inst.labelKey as any)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - promo code & summary card */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
              <div className="bg-white dark:bg-surface transition-colors duration-300 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-border-light flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/20 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Tag size={20} />
                </div>
                <input
                  type="text"
                  placeholder={t('promoCode')}
                  className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
                />
                <button className="text-blue-600 font-semibold text-sm cursor-pointer">{t('apply')}</button>
              </div>

              <div className="bg-white dark:bg-surface transition-colors duration-300 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-border-light space-y-3">
                <div className="flex justify-between text-gray-500 dark:text-text-secondary text-sm">
                  <span>{t('subtotal')}</span>
                  <span className="text-gray-900 dark:text-text-primary font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-text-secondary text-sm">
                  <span>{t('shipping')}</span>
                  <span className="text-gray-900 dark:text-text-primary font-medium">{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-text-secondary text-sm">
                  <span>{t('tax')}</span>
                  <span className="text-gray-900 dark:text-text-primary font-medium">₹0.00</span>
                </div>
                <div className="h-px bg-gray-100 dark:bg-surface-tertiary my-2" />
                <div className="flex justify-between items-end mb-4">
                  <span className="font-bold text-gray-900 dark:text-text-primary">{t('total')}</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(total)}</span>
                </div>
  
                {/* Desktop Proceed Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="hidden lg:flex w-full bg-blue-600 text-white font-semibold rounded-xl py-4 items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{t('proceedToCheckout')}</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="lg:hidden bg-white dark:bg-surface transition-colors duration-300 border-t border-gray-100 dark:border-border-light p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] relative z-10">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            <span>{t('proceedToCheckout')}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
