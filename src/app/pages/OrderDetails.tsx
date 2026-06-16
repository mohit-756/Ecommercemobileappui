import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Receipt, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { cn, formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { hapticService } from '../services/hapticService';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-500/10',
  confirmed: 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10',
  processing: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/10',
  packed: 'bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/10',
  shipped: 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/10',
  out_for_delivery: 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/10',
  delivered: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10',
  cancelled: 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/10',
  received: 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10',
  not_packed: 'bg-gray-50 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-500/10',
  processed: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/10',
  completed: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending Approval',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed & Ready',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  received: 'Received',
  not_packed: 'Not Packed',
  processed: 'Processed',
  completed: 'Completed',
};

export function OrderDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    orderService.getOrderById(orderId)
      .then(res => {
        setOrder(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch order details:', err);
        navigate('/orders');
      })
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    });
  }

  const handleTrackClick = () => {
    hapticService.impact();
    navigate(`/tracking?orderId=${orderId}`);
  };

  const handleItemClick = (productId: string) => {
    hapticService.impact();
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50 dark:bg-background">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen bg-gray-50 dark:bg-background px-6">
        <Package size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary mb-2">Order not found</h2>
        <p className="text-gray-500 dark:text-text-secondary text-sm mb-6">We couldn't retrieve information for this order.</p>
        <button onClick={() => navigate('/orders')} className="bg-blue-600 text-white font-semibold rounded-xl py-3 px-8">
          Back to Orders
        </button>
      </div>
    );
  }

  const displayId = `ORD-${order._id.slice(-6).toUpperCase()}`;
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-background transition-colors duration-300">
      {/* Top sticky header */}
      <div className="bg-white dark:bg-surface pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 dark:border-border-light flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary hover:bg-gray-50 dark:hover:bg-surface-secondary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary ml-2">Order Details</h1>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main content column (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Identifier & Quick Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-border-light"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-surface-tertiary text-gray-600 dark:text-text-secondary rounded font-mono font-bold">
                      {order._id}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-gray-950 dark:text-text-primary mt-1">#{displayId}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-text-secondary mt-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    <span>Placed on {formatDate(order.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide",
                    statusStyles[order.status] || 'bg-gray-50 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400'
                  )}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Tracking Shortcut Banner */}
            {!isCancelled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-4 rounded-2xl flex items-center justify-between cursor-pointer group hover:bg-blue-50 dark:hover:bg-blue-900/15 transition-all"
                onClick={handleTrackClick}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-none">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-950 dark:text-blue-400">Track Shipment</h3>
                    <p className="text-xs text-blue-700/80 dark:text-blue-500/70 mt-0.5">
                      {order.status === 'delivered' ? 'Package delivered successfully' : 'See shipping route and delivery status'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>View Route</span>
                  <ChevronRight size={16} />
                </div>
              </motion.div>
            )}

            {/* Order Items List */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-border-light overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 dark:border-border-light flex items-center gap-2">
                <ShoppingBag size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-text-primary text-base">Items Ordered</h3>
                <span className="text-xs bg-gray-100 dark:bg-surface-tertiary px-2 py-0.5 rounded-full text-gray-500 dark:text-text-secondary font-bold ml-auto">
                  {order.items?.length || 0}
                </span>
              </div>
              
              <div className="divide-y divide-gray-50 dark:divide-border-light">
                {order.items?.map((item: any) => (
                  <div 
                    key={item._id || item.product} 
                    className="p-5 flex gap-4 hover:bg-gray-55 dark:hover:bg-surface-secondary transition-colors cursor-pointer group"
                    onClick={() => handleItemClick(item.product)}
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-surface-tertiary rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-border-light flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <Package className="text-gray-400" size={24} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-950 dark:text-text-primary group-hover:text-blue-600 transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        {item.weight && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold bg-gray-100 dark:bg-surface-tertiary text-gray-600 dark:text-text-secondary px-1.5 py-0.5 rounded">
                            {item.weight}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xs font-bold text-gray-950 dark:text-text-primary">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-text-tertiary font-medium">
                          x {item.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between items-end">
                      <span className="text-sm font-bold text-gray-950 dark:text-text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Buy Again <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
          </div>

          {/* Sidebar column (1/3 width on large screens) */}
          <div className="space-y-6">
            
            {/* Price Breakdown / Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-border-light"
            >
              <h3 className="font-bold text-gray-950 dark:text-text-primary text-base border-b border-gray-50 dark:border-border-light pb-3 mb-4 flex items-center gap-2">
                <Receipt size={18} className="text-blue-600" />
                <span>Price Summary</span>
              </h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-text-primary">{formatPrice(order.subtotal || 0)}</span>
                </div>
                
                <div className="flex justify-between items-center text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-text-primary">
                    {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost || 0)}
                  </span>
                </div>

                {order.tax > 0 && (
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Tax</span>
                    <span className="font-semibold text-gray-900 dark:text-text-primary">{formatPrice(order.tax)}</span>
                  </div>
                )}

                {order.fees > 0 && (
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Convenience Fees</span>
                    <span className="font-semibold text-gray-900 dark:text-text-primary">{formatPrice(order.fees)}</span>
                  </div>
                )}

                {order.tips > 0 && (
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Tip</span>
                    <span className="font-semibold text-gray-900 dark:text-text-primary">{formatPrice(order.tips)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 dark:border-border-light flex justify-between items-center text-base font-black text-gray-950 dark:text-text-primary">
                  <span>Total Paid</span>
                  <span className="text-lg text-blue-600 font-extrabold">{formatPrice(order.total || 0)}</span>
                </div>
              </div>
            </motion.div>

            {/* Shipping Address Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-border-light flex flex-col"
            >
              <h3 className="font-bold text-gray-950 dark:text-text-primary text-base border-b border-gray-50 dark:border-border-light pb-3 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                <span>Delivery Address</span>
              </h3>
              
              {order.shippingAddress ? (
                <div className="text-sm text-gray-600 dark:text-text-secondary space-y-1.5 flex-1">
                  <p className="font-bold text-gray-950 dark:text-text-primary text-base">
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="font-medium text-gray-800 dark:text-text-secondary">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                  </p>
                  <p className="text-xs">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - <span className="font-semibold text-gray-800 dark:text-text-secondary">{order.shippingAddress.pincode}</span>
                  </p>
                  {order.shippingAddress.landmark && (
                    <p className="text-xs bg-gray-50 dark:bg-surface-secondary p-1.5 rounded text-gray-500 italic mt-2 border border-gray-100/50 dark:border-border-light">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                  <div className="pt-2 border-t border-gray-50 dark:border-border-light mt-3 flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400">Phone:</span>
                    <span className="font-bold text-gray-800 dark:text-text-primary">{order.shippingAddress.phone}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No delivery address specified.</p>
              )}
            </motion.div>

            {/* Payment & Fulfillment Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white dark:bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-border-light flex flex-col"
            >
              <h3 className="font-bold text-gray-950 dark:text-text-primary text-base border-b border-gray-50 dark:border-border-light pb-3 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />
                <span>Payment Details</span>
              </h3>
              
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Method</span>
                    <span className="font-bold text-gray-900 dark:text-text-primary uppercase">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay Online'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded",
                      order.paymentDetails?.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600' : 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-600'
                    )}>
                      {order.paymentDetails?.status === 'paid' ? 'Paid' : 'Pending Payment'}
                    </span>
                  </div>
                  {order.paymentDetails?.razorpayPaymentId && (
                    <div className="pt-2 border-t border-gray-50 dark:border-border-light flex justify-between items-center text-[10px] text-gray-400">
                      <span>Payment ID</span>
                      <span className="font-mono">{order.paymentDetails.razorpayPaymentId}</span>
                    </div>
                  )}
                </div>

                {/* Delivery Details / Fulfillment type */}
                <div className="pt-4 border-t border-gray-100 dark:border-border-light mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} className="text-gray-400" />
                    <span>Fulfillment: <span className="font-bold uppercase text-gray-700 dark:text-text-secondary">{order.fulfillmentType || 'delivery'}</span></span>
                  </div>
                  {order.timeSlot && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      Scheduled Slot: <span className="font-medium text-gray-700 dark:text-text-secondary">{order.timeSlot}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Order Notes (if any) */}
            {order.notes && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-amber-50/45 dark:bg-surface-secondary p-4 rounded-2xl border border-amber-100/50 dark:border-border-light text-xs text-gray-600 dark:text-text-secondary"
              >
                <p className="font-bold text-amber-900 dark:text-text-primary mb-1">Customer Note:</p>
                <p className="italic">"{order.notes}"</p>
              </motion.div>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
