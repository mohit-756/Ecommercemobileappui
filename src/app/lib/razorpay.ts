export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export function openRazorpayCheckout(options: RazorpayOptions) {
  const rzp = new (window as any).Razorpay({
    key: options.key,
    amount: options.amount,
    currency: options.currency || 'INR',
    name: options.name || 'DryFruit Hub',
    description: options.description || '',
    image: options.image || '',
    order_id: options.order_id,
    prefill: options.prefill || {},
    notes: options.notes || {},
    theme: { color: options.theme?.color || '#2563eb', ...options.theme },
    handler: options.handler,
    modal: {
      ondismiss: options.modal?.ondismiss || (() => {}),
    },
  });

  rzp.open();
}
