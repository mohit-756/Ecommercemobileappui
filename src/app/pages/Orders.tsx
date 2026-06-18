import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { 
  ChevronLeft, 
  Package, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Star 
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { cn, formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { hapticService } from '../services/hapticService';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';

const statusStyles: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  pending: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', icon: Clock, label: 'Order pending' },
  confirmed: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: Clock, label: 'Order confirmed' },
  processing: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', icon: Clock, label: 'Order processing' },
  shipped: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', icon: Clock, label: 'Order shipped' },
  out_for_delivery: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', icon: Clock, label: 'Out for delivery' },
  delivered: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2, label: 'Order delivered' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2, label: 'Order delivered' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-650 dark:text-red-400', icon: AlertCircle, label: 'Order cancelled' },
};

export function Orders() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const touchStartY = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);

  async function fetchOrders(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await orderService.getUserOrders({ limit: 50 });
      setOrders(res.data.orders);
      if (isRefresh) hapticService.impact();
    } catch (err) {
      console.error('Failed to load orders', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].screenY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].screenY - touchStartY.current;
    if (diff > 150 && window.scrollY === 0) {
      fetchOrders(true);
    }
  };

  function formatOrderDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate();
    const year = d.getFullYear();
    const month = d.toLocaleDateString('en-IN', { month: 'short' });
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;

    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    return `Placed at ${day}${suffix} ${month} ${year}, ${hours}:${minStr} ${ampm}`;
  }

  async function handleOrderAgain(order: any, e: React.MouseEvent) {
    e.stopPropagation();
    hapticService.impact();
    const toastId = toast.loading('Adding items to cart...');
    try {
      for (const item of order.items) {
        const productId = typeof item.product === 'object' && item.product ? item.product._id : item.product;
        await addToCart(productId, item, item.quantity, item.weight);
      }
      toast.success('All items added to cart!', { id: toastId });
      navigate('/cart');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add some items to cart', { id: toastId });
    }
  }

  async function handleRateOrder(orderId: string, ratingValue: number, e: React.MouseEvent) {
    e.stopPropagation();
    hapticService.impact();
    setSubmittingRating(true);
    try {
      await orderService.rateOrder(orderId, ratingValue);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, rating: ratingValue } : o));
      toast.success('Thank you for rating your delivery experience!');
      setRatingOrderId(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  }

  return (
    <div
      className="min-h-full flex flex-col bg-gray-50 dark:bg-background transition-colors duration-300 max-w-4xl mx-auto w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {refreshing && (
        <div className="absolute top-20 left-0 w-full flex justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-surface shadow-md rounded-full p-2"
          >
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        </div>
      )}

      <div className="space-y-6 py-6 w-full">
        <div className="bg-white dark:bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-border-light overflow-hidden">
          {/* Header section */}
          <div className="pt-6 pb-4 px-6 border-b border-gray-100 dark:border-border-light flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary hover:bg-gray-55"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-extrabold text-gray-950 dark:text-text-primary ml-2">Orders</h1>
          </div>

          {/* List section */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-light shadow-sm overflow-hidden">
                    <div className="p-5 flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="px-5 pb-4 border-b border-gray-50 dark:border-border-light">
                      <div className="flex gap-3">
                        {[1, 2, 3].map(j => (
                          <Skeleton key={j} className="w-14 h-14 rounded-xl flex-shrink-0" />
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-surface-secondary/40 py-3.5 px-5">
                      <Skeleton className="h-4 w-40 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-50 dark:bg-surface-tertiary rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-border-light">
                  <Package size={36} className="text-gray-400 dark:text-text-tertiary" />
                </div>
                <h2 className="text-lg font-bold text-gray-950 dark:text-text-primary mb-2">No orders yet</h2>
                <p className="text-gray-550 dark:text-text-secondary text-sm mb-6">Your orders will appear here</p>
                <button 
                  onClick={() => navigate('/home')} 
                  className="bg-blue-600 text-white font-semibold rounded-xl py-3 px-8 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {orders.map((order: any) => {
                  const statusObj = statusStyles[order.status] || { bg: 'bg-gray-50', text: 'text-gray-600', icon: Clock, label: `Order ${order.status}` };
                  const StatusIcon = statusObj.icon;
                  const formattedDate = formatOrderDate(order.createdAt);
                  const isDelivered = order.status === 'delivered' || order.status === 'completed';

                  return (
                    <div
                      key={order._id}
                      className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-light shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/order-details?orderId=${order._id}`)}
                    >
                      {/* Card Top Info */}
                      <div className="p-5 flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon size={16} className={cn(isDelivered ? "text-emerald-500 fill-emerald-100 dark:fill-transparent" : statusObj.text)} />
                            <span className={cn("text-sm font-extrabold tracking-tight", statusObj.text)}>
                              {statusObj.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-medium">
                            {formattedDate}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-955 dark:text-text-primary hover:text-blue-600 transition-colors">
                          <span className="text-sm font-extrabold">
                            {formatPrice(order.total || 0)}
                          </span>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </div>

                      {/* Card Body - Thumbnail slider */}
                      <div className="px-5 pb-4.5 border-b border-gray-50 dark:border-border-light">
                        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
                          {order.items?.map((item: any, index: number) => (
                            <div
                              key={index}
                              className="w-14 h-14 bg-white dark:bg-surface-secondary border border-gray-100 dark:border-border-light rounded-xl p-1.5 flex items-center justify-center flex-shrink-0"
                            >
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as any).src = '/logo.png';
                                  }}
                                />
                              ) : (
                                <Package size={20} className="text-gray-300" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="bg-gray-50/50 dark:bg-surface-secondary/40 py-3.5 px-5">
                        {ratingOrderId === order._id ? (
                          /* Stars Selection Drawer/Row */
                          <div className="flex items-center justify-between py-1" onClick={(e) => e.stopPropagation()}>
                            <span className="text-xs font-bold text-gray-700 dark:text-text-primary">Rate your experience:</span>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  disabled={submittingRating}
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={(e) => handleRateOrder(order._id, star, e)}
                                  className="text-gray-300 hover:scale-110 active:scale-95 transition-all p-0.5"
                                >
                                  <Star
                                    size={20}
                                    className={cn(
                                      "transition-colors",
                                      (hoverRating || 0) >= star
                                        ? "text-amber-500 fill-amber-500"
                                        : "text-gray-300 dark:text-gray-600"
                                    )}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : isDelivered ? (
                          order.rating ? (
                            /* Rated state display */
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-text-secondary">
                                <span>Your delivery experience rating:</span>
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={14}
                                      className={cn(
                                        star <= order.rating
                                          ? "text-amber-500 fill-amber-500"
                                          : "text-gray-200 dark:text-gray-700"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="border-t border-dashed border-gray-200 dark:border-border-light pt-3">
                                <button
                                  type="button"
                                  onClick={(e) => handleOrderAgain(order, e)}
                                  className="w-full text-center font-extrabold text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                                >
                                  Order Again
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Non-rated delivered state: split button */
                            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-border-light">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  hapticService.impact();
                                  setRatingOrderId(order._id);
                                }}
                                className="w-full text-center font-extrabold text-sm text-gray-700 dark:text-text-primary hover:text-gray-900 transition-colors cursor-pointer"
                              >
                                Rate order
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleOrderAgain(order, e)}
                                className="w-full text-center font-extrabold text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                              >
                                Order Again
                              </button>
                            </div>
                          )
                        ) : (
                          /* Non-delivered, non-completed state */
                          <div className="flex justify-between items-center text-sm">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                hapticService.impact();
                                navigate(`/tracking?orderId=${order._id}`);
                              }}
                              className="font-extrabold text-blue-600 hover:text-blue-750 transition-colors cursor-pointer"
                            >
                              Track Order
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOrderAgain(order, e)}
                              className="font-extrabold text-blue-600 hover:text-blue-750 transition-colors cursor-pointer"
                            >
                              Order Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
