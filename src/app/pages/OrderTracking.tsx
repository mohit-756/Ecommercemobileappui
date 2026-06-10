import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ChevronLeft, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { orderService } from '../services/orderService';
import { cn, formatPrice } from '../lib/utils';

interface TrackingEvent {
  status: string;
  label: string;
  description?: string;
  timestamp: string;
}

const TRACKING_ORDER = ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export function OrderTracking() {
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
    orderService.getOrderById(orderId)
      .then(res => setOrder(res.data))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen bg-gray-50 px-6">
        <Package size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">No order selected</h2>
        <p className="text-gray-500 text-sm mb-6">Select an order from your order history</p>
        <button onClick={() => navigate('/orders')} className="bg-blue-600 text-white font-semibold rounded-xl py-3 px-8">
          View Orders
        </button>
      </div>
    );
  }

  const currentStatusIndex = TRACKING_ORDER.indexOf(order.status);
  const tracking = order.tracking || [];

  const steps = TRACKING_ORDER.map((status, idx) => {
    const event = tracking.find((t: TrackingEvent) => t.status === status);
    const isCompleted = idx <= currentStatusIndex;
    const isCurrent = idx === currentStatusIndex;
    return {
      status,
      label: event?.label || status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      description: event?.description || '',
      timestamp: event?.timestamp || null,
      completed: isCompleted,
      current: isCurrent,
    };
  });

  function formatTime(ts: string) {
    if (!ts) return '';
    const d = new Date(ts);
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `${time}, ${date}`;
  }

  const displayId = `ORD-${order._id.slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-0 border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Track Order</h1>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-xs font-medium">Order ID</p>
              <p className="font-bold text-gray-900">{displayId}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs font-medium">Total</p>
              <p className="font-bold text-gray-900">{formatPrice(order.total || 0)}</p>
            </div>
          </div>
          {order.courierDetails?.trackingId && (
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-sm text-gray-600">
              <Truck size={16} className="text-gray-400" />
              Courier: {order.courierDetails.name || 'Standard'} — {order.courierDetails.trackingId}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gray-100" />

            {steps.map((step, idx) => (
              <div key={step.status} className="flex gap-4 mb-8 last:mb-0 relative">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center z-10 relative transition-all",
                  step.completed ? "bg-blue-600 text-white" : step.current ? "bg-blue-100 border-2 border-blue-600 text-blue-600" : "bg-gray-100 text-gray-400"
                )}>
                  {step.completed ? (
                    <CheckCircle2 size={16} />
                  ) : step.current ? (
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                  ) : (
                    <Clock size={14} />
                  )}
                </div>
                <div className={cn("pb-1", idx === steps.length - 1 ? '' : '')}>
                  <h3 className={cn("font-bold text-sm", step.completed || step.current ? "text-gray-900" : "text-gray-400")}>
                    {step.label}
                  </h3>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  )}
                  {step.timestamp && (
                    <p className="text-gray-400 text-xs mt-0.5">{formatTime(step.timestamp)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
