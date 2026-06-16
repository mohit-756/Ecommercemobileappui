import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Package, 
  Bike, 
  DollarSign, 
  CheckCircle, 
  Navigation,
  Compass,
  Clock,
  ArrowRight
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatPrice } from '../lib/utils';
import { toast } from 'sonner';
import { hapticService } from '../services/hapticService';

export function RiderPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'active' | 'earnings'>('jobs');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Claimed order state
  const [claimedOrderId, setClaimedOrderId] = useState<string | null>(
    () => localStorage.getItem('claimed_order_id')
  );
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [activeLoading, setActiveLoading] = useState(false);

  // Fetch orders from customer order list for delivery simulation
  const loadOrders = async () => {
    try {
      const res = await orderService.getUserOrders({ limit: 50 });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders pool');
    } finally {
      setLoading(false);
    }
  };

  // Fetch details of active claimed order
  const loadActiveOrder = async (orderId: string) => {
    setActiveLoading(true);
    try {
      const res = await orderService.getOrderById(orderId);
      setActiveOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load active delivery details');
      // If order not found, clear claim
      localStorage.removeItem('claimed_order_id');
      setClaimedOrderId(null);
    } finally {
      setActiveLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (claimedOrderId) {
      loadActiveOrder(claimedOrderId);
    } else {
      setActiveOrder(null);
    }
  }, [claimedOrderId]);

  // Handle claiming order
  const handleClaimOrder = (orderId: string) => {
    hapticService.impact();
    localStorage.setItem('claimed_order_id', orderId);
    setClaimedOrderId(orderId);
    setActiveTab('active');
    toast.success('Delivery job claimed successfully!');
  };

  // Handle pickup confirmation (shipped / out_for_delivery)
  const handleConfirmPickup = async () => {
    if (!activeOrder) return;
    hapticService.impact();
    const toastId = toast.loading('Confirming pickup...');
    try {
      const res = await orderService.updateRiderStatus(activeOrder._id, 'out_for_delivery', 'Order picked up from store by rider');
      setActiveOrder(res.data);
      toast.success('Pickup confirmed! Proceed to delivery.', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to confirm pickup', { id: toastId });
    }
  };

  // Handle delivery completion
  const handleCompleteDelivery = async () => {
    if (!activeOrder) return;
    hapticService.impact();
    const toastId = toast.loading('Completing delivery...');
    try {
      await orderService.updateRiderStatus(activeOrder._id, 'delivered', 'Order delivered successfully by rider');
      
      // Add order details to completed list in local storage for session earnings tracking
      const sessionDeliveries = JSON.parse(localStorage.getItem('rider_completed_trips') || '[]');
      if (!sessionDeliveries.includes(activeOrder._id)) {
        sessionDeliveries.push(activeOrder._id);
        localStorage.setItem('rider_completed_trips', JSON.stringify(sessionDeliveries));
      }

      // Clear claimed order
      localStorage.removeItem('claimed_order_id');
      setClaimedOrderId(null);
      setActiveOrder(null);
      
      toast.success('Delivery completed! Payout added.', { id: toastId });
      // Reload orders lists
      loadOrders();
      setActiveTab('earnings');
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete delivery', { id: toastId });
    }
  };

  // Handle dropping active order (cancelling claim)
  const handleDropOrder = () => {
    if (!confirm('Are you sure you want to drop this delivery job?')) return;
    hapticService.impact();
    localStorage.removeItem('claimed_order_id');
    setClaimedOrderId(null);
    setActiveOrder(null);
    toast.success('Job dropped. Returned to available pool.');
  };

  // Available jobs are orders in ready-to-deliver state which aren't currently claimed by the rider
  const availableJobs = orders.filter((o: any) => 
    ['confirmed', 'processing', 'packed'].includes(o.status) && o._id !== claimedOrderId
  );

  // Completed deliveries are orders in delivered/completed status
  const completedDeliveries = orders.filter((o: any) => 
    ['delivered', 'completed'].includes(o.status)
  );

  // Calculate session payouts
  const sessionTripIds = JSON.parse(localStorage.getItem('rider_completed_trips') || '[]');
  const sessionTrips = completedDeliveries.filter((o: any) => sessionTripIds.includes(o._id));
  const baseEarnings = sessionTrips.length * 40;
  const tipEarnings = sessionTrips.reduce((sum: number, o: any) => sum + (o.tips || 0), 0);
  const totalEarnings = baseEarnings + tipEarnings;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-background transition-colors duration-300 max-w-4xl mx-auto w-full px-4">
      <div className="space-y-6 py-6 w-full">
        <div className="bg-white dark:bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-border-light overflow-hidden">
          
          {/* Header */}
          <div className="pt-6 pb-2 px-6 border-b border-gray-100 dark:border-border-light flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/profile')} 
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary hover:bg-gray-55"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl font-extrabold text-gray-950 dark:text-text-primary ml-2">Rider Partner Portal</h1>
            </div>
            
            <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              <Bike size={12} />
              <span>Duty On</span>
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-50 dark:border-border-light">
            {[
              { id: 'jobs', label: 'Available Jobs', count: availableJobs.length },
              { id: 'active', label: 'Active Duty', count: claimedOrderId ? 1 : 0 },
              { id: 'earnings', label: 'My Earnings', count: sessionTrips.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { hapticService.selection(); setActiveTab(tab.id as any); }}
                className={`flex-1 py-4 text-center text-xs sm:text-sm font-extrabold border-b-2 transition-all relative cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-text-primary'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            
            {/* Available Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : availableJobs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-text-tertiary">
                    <Compass size={32} className="mx-auto text-gray-300 mb-2 animate-pulse" />
                    <p className="text-sm font-bold text-gray-900 dark:text-text-primary">Scanning order pool...</p>
                    <p className="text-xs text-gray-500 mt-1">No orders are ready for delivery right now.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {availableJobs.map((job) => (
                      <div 
                        key={job._id}
                        className="bg-white dark:bg-surface-secondary/40 border border-gray-100 dark:border-border-light rounded-2xl p-5 shadow-sm space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">FAST DELIVERY</span>
                            <h3 className="text-sm font-extrabold text-gray-950 dark:text-text-primary mt-1">#ORD-{job._id.slice(-6).toUpperCase()}</h3>
                            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{job.items?.length || 0} items</p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                              Payout: ₹40
                            </span>
                            {job.tips > 0 && (
                              <p className="text-[10px] text-blue-500 font-bold mt-1">+ ₹{job.tips} Tip</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs text-gray-700 dark:text-text-secondary border-t border-dashed border-gray-100 dark:border-border-light pt-3.5">
                          <div className="flex gap-2">
                            <span className="font-extrabold text-[10px] text-orange-500 uppercase mt-0.5">Pickup</span>
                            <p className="font-bold">DryFruit Hub Store, HITEC City, Hyderabad</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-extrabold text-[10px] text-blue-500 uppercase mt-0.5">Drop</span>
                            <p className="font-semibold">{job.shippingAddress?.fullName}, {job.shippingAddress?.addressLine1}, {job.shippingAddress?.city}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleClaimOrder(job._id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl transition-all shadow-sm shadow-blue-200 dark:shadow-none cursor-pointer flex justify-center items-center gap-1.5"
                        >
                          <CheckCircle size={16} />
                          <span>Accept & Claim Job</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active Duty Tab */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !activeOrder ? (
                  <div className="text-center py-12 text-gray-400 dark:text-text-tertiary">
                    <Bike size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-900 dark:text-text-primary">No active delivery job</p>
                    <p className="text-xs text-gray-500 mt-1">Claim an order from the available pool to begin.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Active Header card */}
                    <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/20 p-5 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">ON DUTY</span>
                        <h3 className="text-base font-extrabold text-gray-950 dark:text-text-primary mt-1">#ORD-{activeOrder._id.slice(-6).toUpperCase()}</h3>
                        <p className="text-xs text-gray-550 dark:text-text-secondary mt-0.5">Status: <span className="font-extrabold text-blue-600">{activeOrder.status}</span></p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleDropOrder}
                        className="text-xs text-red-500 hover:text-red-650 font-bold border border-red-150 hover:bg-red-50/20 px-3 py-1.5 rounded-full cursor-pointer"
                      >
                        Drop Job
                      </button>
                    </div>

                    {/* Check-step Delivery Timeline */}
                    <div className="space-y-6 relative border-l-2 border-blue-100 dark:border-blue-900/40 pl-6 ml-3">
                      
                      {/* Step 1: Pickup */}
                      <div className="relative">
                        <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-surface ${
                          ['confirmed', 'processing', 'packed'].includes(activeOrder.status) 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-emerald-500'
                        }`} />
                        <div>
                          <h4 className="text-sm font-bold text-gray-950 dark:text-text-primary">1. Collect Package at Store</h4>
                          <p className="text-xs text-gray-500 mt-0.5">DryFruit Hub Store, HITEC City, Hyderabad</p>
                          
                          {/* Items Checklist preview */}
                          <div className="mt-3 bg-gray-50 dark:bg-surface-secondary/40 border border-gray-100 dark:border-border-light rounded-xl p-3.5 space-y-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">CHECKLIST:</span>
                            {activeOrder.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-text-secondary">
                                <span>{item.name} ({item.weight || '1 pack'})</span>
                                <span>x {item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Pickup confirm button */}
                          {['confirmed', 'processing', 'packed'].includes(activeOrder.status) && (
                            <button
                              type="button"
                              onClick={handleConfirmPickup}
                              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <Navigation size={14} />
                              <span>Confirm Pickup & Start Ride</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Step 2: Deliver */}
                      <div className="relative">
                        <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-surface ${
                          ['shipped', 'out_for_delivery'].includes(activeOrder.status) 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                        <div className={['confirmed', 'processing', 'packed'].includes(activeOrder.status) ? 'opacity-50' : ''}>
                          <h4 className="text-sm font-bold text-gray-950 dark:text-text-primary">2. Deliver Package to Customer</h4>
                          {activeOrder.shippingAddress && (
                            <div className="text-xs text-gray-600 dark:text-text-secondary mt-1 space-y-1">
                              <p className="font-extrabold text-gray-950">{activeOrder.shippingAddress.fullName}</p>
                              <p>{activeOrder.shippingAddress.addressLine1}, {activeOrder.shippingAddress.city}</p>
                              <div className="flex items-center gap-2 pt-2">
                                <a 
                                  href={`tel:${activeOrder.shippingAddress.phone}`}
                                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-surface-secondary dark:hover:bg-surface-tertiary px-3 py-1.5 rounded-full text-[10px] text-gray-800 dark:text-text-primary font-bold"
                                >
                                  <Phone size={10} /> Call Customer
                                </a>
                                <span className="text-[10px] text-gray-400 font-bold">Phone: {activeOrder.shippingAddress.phone}</span>
                              </div>
                            </div>
                          )}

                          {/* Complete delivery button */}
                          {['shipped', 'out_for_delivery'].includes(activeOrder.status) && (
                            <button
                              type="button"
                              onClick={handleCompleteDelivery}
                              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle size={14} />
                              <span>Complete Delivery (Delivered)</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === 'earnings' && (
              <div className="space-y-6 animate-fade-in">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-surface-secondary/40 border border-gray-100 dark:border-border-light rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-black text-gray-450 uppercase tracking-widest block">Completed</span>
                    <span className="block text-xl font-black text-gray-900 dark:text-text-primary mt-1.5">{sessionTrips.length}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">Deliveries</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-surface-secondary/40 border border-gray-100 dark:border-border-light rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-black text-gray-450 uppercase tracking-widest block">Base Pay</span>
                    <span className="block text-xl font-black text-gray-900 dark:text-text-primary mt-1.5">{formatPrice(baseEarnings)}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">₹40 / trip</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-surface-secondary/40 border border-gray-100 dark:border-border-light rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-black text-gray-450 uppercase tracking-widest block">Tips & Bonus</span>
                    <span className="block text-xl font-black text-gray-950 dark:text-text-primary mt-1.5">{formatPrice(tipEarnings)}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">100% to Rider</span>
                  </div>
                </div>

                {/* Total Payout block */}
                <div className="bg-blue-600 text-white rounded-2xl p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Total Payout Earnings</span>
                    <h2 className="text-2xl font-black mt-1">{formatPrice(totalEarnings)}</h2>
                  </div>
                  <DollarSign size={36} className="opacity-30" />
                </div>

                {/* Completed Trips list */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-gray-950 dark:text-text-primary">Trip Logs (Session)</h3>
                  {sessionTrips.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No trips logged in this session yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {sessionTrips.map((trip) => (
                        <div 
                          key={trip._id}
                          className="bg-white dark:bg-surface-secondary/20 border border-gray-100 dark:border-border-light rounded-xl p-4 flex justify-between items-center text-xs font-semibold"
                        >
                          <div>
                            <p className="font-extrabold text-gray-900 dark:text-text-primary">#ORD-{trip._id.slice(-6).toUpperCase()}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(trip.updatedAt).toLocaleTimeString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-emerald-600">+ ₹{40 + (trip.tips || 0)}</p>
                            {trip.tips > 0 && <p className="text-[9px] text-gray-400">Incl. ₹{trip.tips} tip</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
