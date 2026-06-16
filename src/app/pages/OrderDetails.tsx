import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  Copy, 
  Download, 
  Star, 
  HelpCircle, 
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { cn, formatPrice } from '../lib/utils';
import { hapticService } from '../services/hapticService';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const statusStyles: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  pending: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', icon: Clock, label: 'Pending Approval' },
  confirmed: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: Clock, label: 'Confirmed' },
  processing: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', icon: Clock, label: 'Processing' },
  packed: { bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', icon: Clock, label: 'Packed & Ready' },
  shipped: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', icon: Clock, label: 'Shipped' },
  out_for_delivery: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', icon: Clock, label: 'Out for Delivery' },
  delivered: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2, label: 'Delivered' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2, label: 'Delivered' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-650 dark:text-red-400', icon: AlertCircle, label: 'Cancelled' },
};

export function OrderDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const { addToCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ratingActive, setRatingActive] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);

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
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    });
  }

  function getArrivedDate(orderObj: any) {
    if (!orderObj) return '';
    const deliveredEvent = orderObj.tracking?.find((t: any) => t.status === 'delivered' || t.status === 'completed');
    if (deliveredEvent) {
      return formatDate(deliveredEvent.timestamp);
    }
    const d = new Date(orderObj.createdAt);
    d.setMinutes(d.getMinutes() + 20);
    return formatDate(d.toISOString());
  }

  const handleOrderAgain = async () => {
    if (!order) return;
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
      toast.error('Failed to add items to cart', { id: toastId });
    }
  };

  const handleRateOrder = async (starValue: number) => {
    if (!order) return;
    hapticService.impact();
    setSubmittingRating(true);
    try {
      await orderService.rateOrder(order._id, starValue);
      setOrder((prev: any) => ({ ...prev, rating: starValue }));
      toast.success('Thank you for your rating!');
      setRatingActive(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    hapticService.impact();
    navigator.clipboard.writeText(text);
    toast.success('Order ID copied to clipboard!');
  };

  const handleDownloadInvoice = () => {
    hapticService.impact();
    const toastId = toast.loading('Generating invoice...');
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([
        `DRYFRUIT HUB INVOICE\n`,
        `====================\n`,
        `Order ID: ${order._id}\n`,
        `Date: ${formatDate(order.createdAt)}\n`,
        `Customer: ${order.shippingAddress?.fullName || 'N/A'}\n`,
        `Phone: ${order.shippingAddress?.phone || 'N/A'}\n`,
        `Address: ${order.shippingAddress?.addressLine1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}\n`,
        `--------------------\n`,
        order.items?.map((item: any) => `${item.name} x ${item.quantity} - ${formatPrice(item.price * item.quantity)}`).join('\n'),
        `\n--------------------\n`,
        `Subtotal: ${formatPrice(order.subtotal || 0)}\n`,
        `Delivery Cost: ${formatPrice(order.shippingCost || 0)}\n`,
        `Total: ${formatPrice(order.total || 0)}\n`,
        `Thank you for shopping with us!\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Invoice_${order._id.slice(-6).toUpperCase()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Invoice downloaded successfully!', { id: toastId });
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50 dark:bg-background">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen bg-gray-50 dark:bg-background px-6">
        <Package size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary mb-2">Order not found</h2>
        <p className="text-gray-550 dark:text-text-secondary text-sm mb-6">We couldn't retrieve information for this order.</p>
        <button onClick={() => navigate('/orders')} className="bg-blue-650 text-white font-semibold rounded-xl py-3 px-8">
          Back to Orders
        </button>
      </div>
    );
  }

  const displayId = order._id.slice(-6).toUpperCase();
  const isDelivered = order.status === 'delivered' || order.status === 'completed';
  const statusObj = statusStyles[order.status] || { bg: 'bg-gray-50', text: 'text-gray-600', icon: Clock, label: order.status };
  const StatusIcon = statusObj.icon;

  const itemsWithOriginalPrices = order.items?.map((item: any) => {
    const productOriginalPrice = item.product?.originalPrice;
    const computedOriginalPrice = productOriginalPrice || Math.round(item.price * (item.price > 20 ? 1.3 : 1.6));
    return {
      ...item,
      originalPrice: computedOriginalPrice
    };
  });

  const originalSubtotal = itemsWithOriginalPrices?.reduce((sum: number, item: any) => sum + item.originalPrice * item.quantity, 0) || 0;
  const originalTotal = originalSubtotal + (order.shippingCost || 40);

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-background transition-colors duration-300 max-w-4xl mx-auto w-full">
      <div className="space-y-6 py-6 w-full">
        <div className="bg-white dark:bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-border-light overflow-hidden">
          
          {/* Header section */}
          <div className="pt-6 pb-4 px-6 border-b border-gray-100 dark:border-border-light flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/orders')} 
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary hover:bg-gray-55"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="ml-2">
                <h1 className="text-lg font-extrabold text-gray-950 dark:text-text-primary">Order #ORD-{displayId}</h1>
                <p className="text-xs font-semibold text-gray-400 dark:text-text-secondary mt-0.5">{order.items?.length || 0} items</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                hapticService.impact();
                toast.success("Connecting with support chat...");
                navigate('/support');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-100 hover:border-blue-200 dark:border-blue-500/20 dark:hover:border-blue-500/40 rounded-full cursor-pointer transition-colors"
            >
              <HelpCircle size={14} />
              <span>Get Help</span>
            </button>
          </div>

          {/* Status Banner */}
          <div className="p-6">
            <div className={cn("p-5 rounded-2xl flex items-center gap-4.5 border", statusObj.bg)}>
              <div className="w-10 h-10 rounded-full bg-white dark:bg-surface flex items-center justify-center flex-shrink-0 shadow-sm">
                <StatusIcon size={22} className={cn("text-emerald-500 fill-emerald-100 dark:fill-transparent", statusObj.text)} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-950 dark:text-text-primary leading-tight">{statusObj.label}</h2>
                <p className="text-xs font-medium text-gray-500 dark:text-text-secondary mt-0.5">
                  {isDelivered ? `Delivered successfully to your address` : `Order status: ${order.status}`}
                </p>
              </div>
            </div>
          </div>

          {/* Items in Order */}
          <div className="px-6 pb-6">
            <div className="border border-gray-100 dark:border-border-light rounded-2xl overflow-hidden">
              <div className="bg-gray-50/50 dark:bg-surface-secondary/40 px-5 py-4 border-b border-gray-100 dark:border-border-light flex items-center gap-2">
                <ShoppingBag size={16} className="text-blue-500" />
                <h3 className="text-sm font-extrabold text-gray-950 dark:text-text-primary">
                  {order.items?.length || 0} items in order
                </h3>
              </div>

              <div className="divide-y divide-gray-50 dark:divide-border-light">
                {itemsWithOriginalPrices?.map((item: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-5 flex gap-4 hover:bg-gray-50/30 dark:hover:bg-surface-secondary/20 transition-colors"
                  >
                    <div className="w-16 h-16 bg-white dark:bg-surface-secondary border border-gray-100 dark:border-border-light rounded-xl p-1.5 flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <Package size={24} className="text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-sm font-bold text-gray-950 dark:text-text-primary leading-snug line-clamp-2">{item.name}</h4>
                        <p className="text-[11px] text-gray-400 font-semibold mt-1">
                          {item.weight || '1 pack'} &bull; {item.quantity} unit{item.quantity !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-center items-end flex-shrink-0">
                      <div className="text-sm font-extrabold text-gray-955 dark:text-text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.originalPrice > item.price && (
                        <div className="text-xs text-gray-400 font-semibold line-through mt-0.5">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="px-6 pb-6">
            <div className="border border-gray-100 dark:border-border-light rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-gray-950 dark:text-text-primary flex items-center gap-1.5">
                <span className="w-1 h-3.5 bg-blue-500 rounded-full"></span>
                <span>Bill Summary</span>
              </h3>

              <div className="space-y-2.5 text-xs font-semibold text-gray-500 dark:text-text-secondary">
                <div className="flex justify-between items-center">
                  <span>Item Total</span>
                  <div className="flex items-center gap-2">
                    {originalSubtotal > (order.subtotal || 0) && (
                      <span className="line-through text-gray-400 font-normal">{formatPrice(originalSubtotal)}</span>
                    )}
                    <span className="text-gray-900 dark:text-text-primary font-extrabold">{formatPrice(order.subtotal || 0)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <div className="flex items-center gap-2">
                    {order.shippingCost === 0 ? (
                      <>
                        <span className="line-through text-gray-450 font-normal">₹40</span>
                        <span className="text-emerald-600 font-bold">Free</span>
                      </>
                    ) : (
                      <span className="text-gray-900 dark:text-text-primary font-extrabold">{formatPrice(order.shippingCost)}</span>
                    )}
                  </div>
                </div>

                {order.tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Taxes & charges</span>
                    <span className="text-gray-900 dark:text-text-primary font-extrabold">{formatPrice(order.tax)}</span>
                  </div>
                )}

                <div className="pt-3.5 border-t border-dashed border-gray-200 dark:border-border-light flex justify-between items-center text-sm">
                  <span className="text-gray-950 dark:text-text-primary font-extrabold">Total Bill</span>
                  <div className="flex items-center gap-2">
                    {originalTotal > (order.total || 0) && (
                      <span className="line-through text-gray-455 text-xs font-normal">{formatPrice(originalTotal)}</span>
                    )}
                    <span className="text-gray-955 dark:text-text-primary font-black text-base">{formatPrice(order.total || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="w-full bg-blue-50 hover:bg-blue-100/70 dark:bg-blue-950/15 dark:hover:bg-blue-950/35 text-blue-600 dark:text-blue-400 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>Download Invoice / Credit Note</span>
                </button>
              </div>
            </div>
          </div>

          {/* Order Details (address, placed time, arrived time) */}
          <div className="px-6 pb-6">
            <div className="border border-gray-100 dark:border-border-light rounded-2xl p-5 space-y-4.5">
              <h3 className="text-sm font-extrabold text-gray-950 dark:text-text-primary flex items-center gap-1.5">
                <span className="w-1 h-3.5 bg-blue-500 rounded-full"></span>
                <span>Order Details</span>
              </h3>

              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <div className="text-gray-400 dark:text-text-tertiary">Order ID</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-900 dark:text-text-primary font-extrabold select-all">#ORD-{displayId}</span>
                    <button 
                      type="button"
                      onClick={() => copyToClipboard(order._id)} 
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                      title="Copy complete Order ID"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div>
                    <div className="text-gray-400 dark:text-text-tertiary">Delivery Address</div>
                    <div className="text-gray-900 dark:text-text-primary font-bold mt-1.5 space-y-0.5 leading-relaxed">
                      <p className="font-extrabold text-gray-950">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                      <p className="text-[11px] text-gray-500 font-medium pt-0.5">Phone: {order.shippingAddress.phone}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="text-gray-400 dark:text-text-tertiary">Order Placed at</div>
                    <div className="text-gray-900 dark:text-text-primary font-bold mt-1">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 dark:text-text-tertiary">
                      {isDelivered ? 'Order Arrived at' : 'Estimated Delivery'}
                    </div>
                    <div className="text-gray-900 dark:text-text-primary font-bold mt-1">
                      {getArrivedDate(order)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions footer */}
          <div className="bg-gray-50/50 dark:bg-surface-secondary/40 border-t border-gray-100 dark:border-border-light p-6 flex flex-col gap-4">
            {ratingActive ? (
              /* Star Selector */
              <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-surface rounded-2xl border border-gray-150 dark:border-border-light shadow-sm">
                <span className="text-sm font-bold text-gray-700 dark:text-text-primary">Rate your experience:</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={submittingRating}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRateOrder(star)}
                      className="text-gray-300 hover:scale-110 active:scale-95 transition-all p-1"
                    >
                      <Star
                        size={28}
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
            ) : isDelivered && order.rating ? (
              /* Already rated display */
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-1.5 px-1">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-800 dark:text-text-secondary">
                  <span>Your delivery experience rating:</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={cn(
                          star <= order.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-200 dark:text-gray-700"
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleOrderAgain}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 px-8 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm shadow-blue-200 dark:shadow-none"
                >
                  Order Again
                </button>
              </div>
            ) : (
              /* Actions buttons row */
              <div className="flex items-center gap-4">
                {isDelivered ? (
                  <button
                    type="button"
                    onClick={() => {
                      hapticService.impact();
                      setRatingActive(true);
                    }}
                    className="flex-1 bg-white hover:bg-gray-50 border border-blue-600 text-blue-600 font-extrabold text-sm py-3.5 rounded-xl transition-all active:scale-98 cursor-pointer flex justify-center items-center"
                  >
                    Rate Order
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      hapticService.impact();
                      navigate(`/tracking?orderId=${order._id}`);
                    }}
                    className="flex-1 bg-white hover:bg-gray-55 border border-blue-600 text-blue-600 font-extrabold text-sm py-3.5 rounded-xl transition-all active:scale-98 cursor-pointer flex justify-center items-center"
                  >
                    Track Shipment
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleOrderAgain}
                  className="flex-grow-[1.5] bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all active:scale-98 cursor-pointer shadow-sm shadow-blue-200 dark:shadow-none flex justify-center items-center"
                >
                  Order Again
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
