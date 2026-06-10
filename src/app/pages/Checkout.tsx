import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, MapPin, CreditCard, Wallet, ShieldCheck, Banknote, Star, ExternalLink, Loader2, Zap } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { addressService } from '../services/addressService';
import { shippingService } from '../services/shippingService';
import { orderService } from '../services/orderService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { loadRazorpayScript, openRazorpayCheckout } from '../lib/razorpay';
import { toast } from 'sonner';
import { hapticService } from '../services/hapticService';

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
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [pincodeStatus, setPincodeStatus] = useState<{ serviceable: boolean; estimatedDays: number | null } | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    addressService.getAddresses()
      .then(res => {
        const addrs = res.data;
        setAddresses(addrs);
        const defaultAddr = addrs.find((a: Address) => a.isDefault) || addrs[0] || null;
        setSelectedAddress(defaultAddr);
      })
      .catch(() => toast.error('Failed to load addresses'))
      .finally(() => setLoading(false));
  }, []);

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
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  async function handlePlaceOrder() {
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
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image || item.product.images?.[0] || '',
      }));

      const res = await orderService.createOrder({
        items: cartItems,
        shippingAddress,
        paymentMethod,
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setPlacing(false);
    }
  }

  const paymentMethods = [
    { id: 'upi', name: 'UPI (GPay / PhonePe / Paytm)', icon: ShieldCheck, popular: true },
    { id: 'razorpay', name: 'Credit / Debit Card', icon: CreditCard },
    { id: 'razorpay', name: 'Wallet / Net Banking', icon: Wallet },
    { id: 'cod', name: 'Cash on Delivery', icon: Banknote },
  ];

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-0 border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Checkout</h1>
      </div>

      <div className="flex-1 px-6 py-6 pb-32 lg:pb-6 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Shipping Address</h3>
                <button onClick={() => navigate('/addresses')} className="text-blue-600 text-sm font-medium flex items-center gap-1">
                  Manage <ExternalLink size={14} />
                </button>
              </div>

              {addresses.length === 0 ? (
                <button onClick={() => navigate('/addresses')} className="w-full bg-white p-4 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition-colors">
                  <MapPin size={20} /> Add Shipping Address
                </button>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label key={addr._id} className={cn(
                      "flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all bg-white",
                      selectedAddress?._id === addr._id ? 'border-blue-600 ring-1 ring-blue-600 shadow-sm' : 'border-gray-100'
                    )}>
                      <div className="mt-0.5">
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedAddress?._id === addr._id ? 'border-blue-600' : 'border-gray-300')}>
                          {selectedAddress?._id === addr._id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => setSelectedAddress(addr)}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900 capitalize text-sm">{addr.label}</span>
                          {addr.isDefault && <Star size={12} className="text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{addr.fullName}, {addr.addressLine1}, {addr.city}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>
                      </div>
                      <input type="radio" name="address" className="hidden" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} />
                    </label>
                  ))}
                </div>
              )}

              {selectedAddress && (
                <div className="mt-3 flex items-center gap-2">
                  {checkingPincode ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500"><div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> Checking delivery...</div>
                  ) : pincodeStatus ? (
                    pincodeStatus.serviceable ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-bold">
                        <Zap size={12} className="fill-emerald-600" /> FREE DELIVERY IN 12 MINS
                      </div>
                    ) : (
                      <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium">✕ Delivery not available</span>
                    )
                  ) : null}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Items ({items.length})</span>
                  <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Handling Charge</span>
                  <span className="text-gray-900 font-medium">₹2.00</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Payment Method</h3>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                  <ShieldCheck size={12} /> Secure
                </div>
              </div>
              <div className="space-y-2">
                {paymentMethods.map((method, idx) => {
                  const methodId = method.id === 'cod' ? 'cod' : 'razorpay';
                  return (
                    <label key={idx} className={cn(
                      "flex items-center p-4 rounded-2xl border cursor-pointer transition-all bg-white relative",
                      paymentMethod === methodId ? "border-blue-600 ring-1 ring-blue-600 shadow-sm" : "border-gray-100"
                    )}>
                      <method.icon size={24} className={cn("mr-4", paymentMethod === methodId ? "text-blue-600" : "text-gray-400")} />
                      <div className="flex-1">
                        <span className={cn("font-bold block text-sm", paymentMethod === methodId ? "text-blue-900" : "text-gray-700")}>{method.name}</span>
                        {(method as any).popular && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Popular</span>}
                      </div>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", paymentMethod === methodId ? "border-blue-600" : "border-gray-300")}>
                        {paymentMethod === methodId && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                      </div>
                      <input type="radio" name="payment" className="hidden" checked={paymentMethod === methodId} onChange={() => setPaymentMethod(methodId)} />
                    </label>
                  );
                })}
              </div>
              {paymentMethod === 'razorpay' && (
                <p className="text-xs text-gray-400 mt-2">You will be redirected to Razorpay to complete payment</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bg-white border-t border-gray-100 p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] relative z-10">
        <div className="flex justify-between items-end mb-4">
          <span className="text-gray-500">Total Payment</span>
          <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={!selectedAddress || (pincodeStatus && !pincodeStatus.serviceable) || placing}
          className="w-full bg-gray-900 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {placing ? (
            <><Loader2 size={20} className="animate-spin" /> Processing...</>
          ) : (
            <>Place Order — {formatPrice(total)}</>
          )}
        </button>
      </div>
    </div>
  );
}
