import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, MapPin, CreditCard, Wallet, ShieldCheck, Banknote, Star, ExternalLink, Loader2, Zap, X, Home, Briefcase } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { addressService } from '../services/addressService';
import { shippingService } from '../services/shippingService';
import { orderService } from '../services/orderService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useDeliveryLocation } from '../contexts/LocationContext';
import { loadRazorpayScript, openRazorpayCheckout } from '../lib/razorpay';
import { toast } from 'sonner';
import { hapticService } from '../services/hapticService';
import { motion, AnimatePresence } from 'motion/react';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  label: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const { addressDetails } = useDeliveryLocation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [authError, setAuthError] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<{ serviceable: boolean; estimatedDays: number | null } | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  // New states for inline address creation
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    label: 'home' as 'home' | 'work' | 'other',
    isDefault: true,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const handleOpenAddAddress = () => {
    let prefilledCity = addressDetails?.city || '';
    let prefilledState = addressDetails?.state || '';
    let prefilledPincode = addressDetails?.pincode || '';
    let prefilledLine1 = addressDetails?.addressLine1 || '';
    let prefilledLine2 = addressDetails?.addressLine2 || '';

    // Fallback if addressDetails is not available but we have deliveryLocation
    if (!prefilledCity && localStorage.getItem('delivery_location')) {
      const locStr = localStorage.getItem('delivery_location') || '';
      if (locStr === 'Mumbai, India') {
        prefilledCity = 'Mumbai';
        prefilledState = 'Maharashtra';
        prefilledPincode = '400001';
      } else {
        const parts = locStr.split(',');
        prefilledCity = parts[0]?.trim() || '';
        prefilledState = parts[1]?.trim() || '';
      }
    }

    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      addressLine1: prefilledLine1,
      addressLine2: prefilledLine2,
      city: prefilledCity,
      state: prefilledState,
      pincode: prefilledPincode,
      landmark: '',
      label: 'home',
      isDefault: true,
    });
    setShowAddAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.addressLine1.trim() || !addressForm.pincode.trim() || !addressForm.city.trim() || !addressForm.state.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await addressService.createAddress(addressForm);
      toast.success('Address saved successfully!');
      
      // Re-fetch addresses
      const addrsRes = await addressService.getAddresses();
      const addrs = addrsRes.data;
      setAddresses(addrs);
      
      // Select the new address
      const newAddr = addrs.find((a: any) => a._id === res.data._id) || res.data;
      setSelectedAddress(newAddr);
      
      setShowAddAddressModal(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAuthError(true);
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save address');
      }
    } finally {
      setSavingAddress(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setAuthError(true);
      setLoading(false);
      return;
    }
    addressService.getAddresses()
      .then(res => {
        const addrs = res.data;
        setAddresses(addrs);
        const defaultAddr = addrs.find((a: Address) => a.isDefault) || addrs[0] || null;
        setSelectedAddress(defaultAddr);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setAuthError(true);
          toast.error('Session expired. Please login again.');
        } else {
          toast.error('Failed to load addresses');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!selectedAddress) return;
    setPincodeStatus(null);
    setCheckingPincode(true);
    shippingService.checkPincode(selectedAddress.pincode)
      .then(res => setPincodeStatus(res.data))
      .catch(() => setPincodeStatus({ serviceable: false, estimatedDays: null }))
      .finally(() => setCheckingPincode(false));
  }, [selectedAddress]);

  const shipping = subtotal >= 500 ? 0 : 40;
  const handlingCharge = 2;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + handlingCharge + tax;

  async function handlePlaceOrder() {
    if (!user || !token) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    if (pincodeStatus && !pincodeStatus.serviceable) {
      toast.error('Delivery not available to this pincode');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacing(true);

    const shippingAddress = {
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      addressLine1: selectedAddress.addressLine1,
      addressLine2: selectedAddress.addressLine2 || '',
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      landmark: selectedAddress.landmark || '',
    };

    try {
      const cartItems = items.map(item => ({
        product: item.product._id || item.product.id,
        name: item.product.name,
        price: item.selectedPrice !== undefined && item.selectedPrice !== null ? item.selectedPrice : item.product.price,
        quantity: item.quantity,
        image: item.product.image || item.product.images?.[0] || '',
        weight: item.selectedWeight || null,
      }));

      const res = await orderService.createOrder({
        items: cartItems,
        shippingAddress,
        paymentMethod: paymentMethod as 'razorpay' | 'cod',
      });

      const { order, razorpayOrder, razorpayKeyId } = res.data;

      if (paymentMethod === 'cod') {
        await hapticService.notificationSuccess();
        await clearCart();
        navigate(`/success?orderId=${order._id}`);
        return;
      }

      const isDevKey = razorpayKeyId === 'your_razorpay_key_id' || !razorpayKeyId;

      if (isDevKey) {
        await orderService.verifyPayment({
          orderId: order._id,
          razorpayPaymentId: 'dev_payment_' + Date.now(),
          razorpaySignature: 'dev_signature',
        });
        await hapticService.notificationSuccess();
        await clearCart();
        navigate(`/success?orderId=${order._id}`);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        setPlacing(false);
        return;
      }

      try {
        openRazorpayCheckout({
          key: razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          order_id: razorpayOrder.id,
          name: 'DryFruit Hub',
          description: `Order #${order._id.slice(-6).toUpperCase()}`,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: selectedAddress.phone,
          },
          theme: { color: '#2563eb' },
          handler: async (response) => {
            try {
              await orderService.verifyPayment({
                orderId: order._id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              await clearCart();
              navigate(`/success?orderId=${order._id}`);
            } catch {
              toast.error('Payment verification failed');
              setPlacing(false);
            }
          },
          modal: {
            ondismiss: () => setPlacing(false),
          },
        });
      } catch {
        toast.error('Failed to open payment gateway');
        setPlacing(false);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAuthError(true);
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to place order');
      }
      setPlacing(false);
    }
  }

  const paymentMethods = [
    { 
      id: 'razorpay', 
      name: 'Pay Online', 
      subtitle: 'UPI, Credit/Debit Card, Wallet & Net Banking',
      icon: ShieldCheck, 
      popular: true 
    },
    { id: 'cod', name: 'Cash on Delivery', icon: Banknote },
  ];

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-background lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none lg:bg-transparent transition-colors duration-300 overflow-hidden">
      <div className="bg-white dark:bg-surface pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 dark:border-border-light flex items-center transition-colors duration-300">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary ml-2">Checkout</h1>
      </div>

      <div className="flex-1 px-6 py-6 pb-32 lg:pb-6 space-y-6 overflow-y-auto">
        {authError ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-text-primary mb-2">Session Expired</h3>
            <p className="text-sm text-gray-500 dark:text-text-secondary text-center mb-6">Your session has expired. Please login again to continue.</p>
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }} className="bg-blue-600 text-white font-semibold rounded-xl py-3 px-8 hover:bg-blue-700 transition-colors cursor-pointer">Go to Login</button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-text-primary">Shipping Address</h3>
                  <div className="flex items-center gap-3">
                    <button onClick={handleOpenAddAddress} className="text-blue-600 text-sm font-bold flex items-center gap-1 cursor-pointer hover:underline">
                      + Add New
                    </button>
                    <span className="text-gray-300 dark:text-border-light text-xs">|</span>
                    <button onClick={() => navigate('/addresses')} className="text-gray-550 dark:text-text-secondary text-sm font-medium flex items-center gap-1 cursor-pointer hover:text-blue-600 hover:underline">
                      Manage <ExternalLink size={14} />
                    </button>
                  </div>
                </div>

                {addresses.length === 0 ? (
                  <button onClick={handleOpenAddAddress} className="w-full bg-white dark:bg-surface p-4 rounded-2xl border border-dashed border-gray-300 dark:border-border-medium flex items-center justify-center gap-2 text-gray-500 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-background transition-colors cursor-pointer">
                    <MapPin size={20} /> Add Shipping Address
                  </button>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label key={addr._id} className={cn(
                        "flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all bg-white dark:bg-surface",
                        selectedAddress?._id === addr._id ? 'border-blue-600 ring-1 ring-blue-600 shadow-sm' : 'border-gray-100 dark:border-border-light'
                      )}>
                        <div className="mt-0.5">
                          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedAddress?._id === addr._id ? 'border-blue-600' : 'border-gray-300 dark:border-border-medium')}>
                            {selectedAddress?._id === addr._id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0" onClick={() => setSelectedAddress(addr)}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-gray-900 dark:text-text-primary capitalize text-sm">{addr.label}</span>
                            {addr.isDefault && <Star size={12} className="text-amber-500 fill-amber-500" />}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-text-secondary line-clamp-1">{addr.fullName}, {addr.addressLine1}, {addr.city}</p>
                          <p className="text-xs text-gray-400 dark:text-text-tertiary mt-0.5">{addr.phone}</p>
                        </div>
                        <input type="radio" name="address" className="hidden" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} />
                      </label>
                    ))}
                  </div>
                )}

                {selectedAddress && (
                  <div className="mt-3 flex items-center gap-2">
                    {checkingPincode ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-text-secondary"><div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> Checking delivery...</div>
                    ) : pincodeStatus ? (
                      pincodeStatus.serviceable ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-3 py-1.5 rounded-full font-bold">
                          <Zap size={12} className="fill-emerald-600" /> FREE INSTANT DELIVERY AVAILABLE
                        </div>
                      ) : (
                        <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium">✕ Delivery not available</span>
                      )
                    ) : null}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-text-primary mb-3">Order Summary</h3>
                <div className="bg-white dark:bg-surface rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-border-light space-y-2">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-text-secondary">
                    <span>Items ({items.length})</span>
                    <span className="text-gray-900 dark:text-text-primary font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-text-secondary">
                    <span>Delivery Fee</span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">Free</span>
                    ) : (
                      <span className="text-gray-900 dark:text-text-primary font-medium">{formatPrice(shipping)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-text-secondary">
                    <span>Handling Charge</span>
                    <span className="text-gray-900 dark:text-text-primary font-medium">{formatPrice(handlingCharge)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-sm text-gray-500 dark:text-text-secondary">
                      <span>GST (8%)</span>
                      <span className="text-gray-900 dark:text-text-primary font-medium">{formatPrice(tax)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-text-primary">Payment Method</h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    <ShieldCheck size={12} /> Secure
                  </div>
                </div>
                <div className="space-y-2">
                  {paymentMethods.map((method, idx) => {
                    return (
                      <label key={idx} className={cn(
                        "flex items-center p-4 rounded-2xl border cursor-pointer transition-all bg-white dark:bg-surface relative",
                        paymentMethod === method.id ? "border-blue-600 ring-1 ring-blue-600 shadow-sm" : "border-gray-100 dark:border-border-light"
                      )}>
                        <method.icon size={24} className={cn("mr-4", paymentMethod === method.id ? "text-blue-600" : "text-gray-400 dark:text-text-tertiary")} />
                        <div className="flex-1">
                          <span className={cn("font-bold block text-sm", paymentMethod === method.id ? "text-blue-900 dark:text-blue-300" : "text-gray-700 dark:text-text-primary")}>{method.name}</span>
                          {(method as any).subtitle && (
                            <span className="text-[10px] text-gray-400 dark:text-text-tertiary">{(method as any).subtitle}</span>
                          )}
                          {(method as any).popular && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tight">Popular</span>}
                        </div>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", paymentMethod === method.id ? "border-blue-600" : "border-gray-300 dark:border-border-medium")}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                      </label>
                    );
                  })}
                </div>
                {paymentMethod !== 'cod' && (
                  <p className="text-xs text-gray-400 dark:text-text-tertiary mt-2">You will be redirected to Razorpay to complete payment</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="hidden lg:block lg:col-span-1 space-y-6 lg:sticky lg:top-24">
              <div className="bg-white dark:bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-border-light space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-text-primary mb-2">Order Total</h3>
                <div className="flex justify-between items-end mb-4">
                  <span className="text-gray-500 dark:text-text-secondary text-sm">Total Payment</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-text-primary">{formatPrice(total)}</span>
                </div>
                <button
                  onClick={selectedAddress ? handlePlaceOrder : handleOpenAddAddress}
                  disabled={(selectedAddress && pincodeStatus && !pincodeStatus.serviceable) || placing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {placing ? (
                    <><Loader2 size={20} className="animate-spin" /> Processing...</>
                  ) : !selectedAddress ? (
                    <>Add Delivery Address</>
                  ) : (
                    <>Place Order — {formatPrice(total)}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:hidden bg-white dark:bg-surface border-t border-gray-100 dark:border-border-light p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] relative z-10 transition-colors duration-300">
        <div className="flex justify-between items-end mb-4">
          <span className="text-gray-500 dark:text-text-secondary">Total Payment</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-text-primary">{formatPrice(total)}</span>
        </div>
        <button
          onClick={selectedAddress ? handlePlaceOrder : handleOpenAddAddress}
          disabled={(selectedAddress && pincodeStatus && !pincodeStatus.serviceable) || placing}
          className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {placing ? (
            <><Loader2 size={20} className="animate-spin" /> Processing...</>
          ) : !selectedAddress ? (
            <>Add Delivery Address</>
          ) : (
            <>Place Order — {formatPrice(total)}</>
          )}
        </button>
      </div>

      {/* Modal / Drawer for Adding Address Details */}
      <AnimatePresence>
        {showAddAddressModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowAddAddressModal(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
              className="relative w-full sm:max-w-md bg-white dark:bg-surface rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transition-colors duration-300 z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-text-primary tracking-tight">
                    Add Address Details
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-text-tertiary mt-0.5">
                    We will save this address for your order
                  </p>
                </div>
                <button
                  onClick={() => setShowAddAddressModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-50 dark:bg-surface-secondary flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-text-secondary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveAddress} className="space-y-4 text-left">
                {/* Label Selector */}
                <div className="flex gap-3">
                  {(['home', 'work', 'other'] as const).map((lbl) => {
                    const isActive = addressForm.label === lbl;
                    const Icon = lbl === 'home' ? Home : lbl === 'work' ? Briefcase : MapPin;
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer",
                          isActive
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-150 dark:border-border-light text-gray-550 dark:text-text-secondary hover:border-gray-250 dark:hover:border-border-medium'
                        )}
                      >
                        <Icon size={18} />
                        <span className="text-[10px] font-bold capitalize tracking-wide">{lbl}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-1">Receiver's Name *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="Receiver's Name"
                      className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-255 dark:border-border-light text-gray-900 dark:text-text-primary rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-255 dark:border-border-light text-gray-900 dark:text-text-primary rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Flat / House No / Road */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-1">House / Flat No., Floor, Building *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.addressLine1}
                    onChange={e => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    placeholder="e.g. Flat 402, Royal Palms"
                    className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-255 dark:border-border-light text-gray-900 dark:text-text-primary rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all"
                  />
                </div>

                {/* Area / Road Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-1">Area / Sector / Road Name *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.addressLine2}
                    onChange={e => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    placeholder="e.g. Bandra West, Linking Road"
                    className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-255 dark:border-border-light text-gray-900 dark:text-text-primary rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all"
                  />
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="City"
                      className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-255 dark:border-border-light text-gray-900 dark:text-text-primary rounded-xl py-3 px-3 focus:ring-2 focus:ring-blue-600 outline-none text-xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="State"
                      className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-255 dark:border-border-light text-gray-900 dark:text-text-primary rounded-xl py-3 px-3 focus:ring-2 focus:ring-blue-600 outline-none text-xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.pincode}
                      onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      placeholder="Pincode"
                      className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-255 dark:border-border-light text-gray-900 dark:text-text-primary rounded-xl py-3 px-3 focus:ring-2 focus:ring-blue-600 outline-none text-xs transition-all"
                    />
                  </div>
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    placeholder="e.g. Near HDFC Bank"
                    className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-255 dark:border-border-light text-gray-900 dark:text-text-primary rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {savingAddress ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving Address...</>
                  ) : (
                    'Save Address & Deliver Here'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
