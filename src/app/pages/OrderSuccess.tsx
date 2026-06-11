import { useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, Package, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { hapticService } from '../services/hapticService';

export function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  useEffect(() => {
    // Success haptic and confetti
    hapticService.notificationSuccess();

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const displayId = useMemo(() => {
    if (!orderId) return 'ORD-12345';
    return `ORD-${orderId.slice(-6).toUpperCase()}`;
  }, [orderId]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen bg-white dark:bg-surface transition-colors duration-300 px-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-8"
      >
        <CheckCircle2 size={48} />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2 text-center"
      >
        Order Placed Successfully!
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 dark:text-text-secondary text-center mb-6 max-w-[280px]"
      >
        Thank you for your purchase. Your order {displayId} is being processed.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="bg-gray-50 dark:bg-surface-secondary rounded-2xl p-4 mb-10 w-full max-w-sm"
      >
        <div className="flex items-center gap-3">
          <Package size={20} className="text-blue-600" />
          <div className="text-sm">
            <p className="font-semibold text-gray-900 dark:text-text-primary">Order #{displayId}</p>
            <p className="text-gray-500 dark:text-text-secondary">Estimated delivery in 3-5 business days</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        {orderId && (
          <button
            onClick={() => navigate(`/tracking?orderId=${orderId}`)}
            className="w-full bg-white dark:bg-surface border-2 border-blue-600 text-blue-600 font-semibold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-500/20 active:scale-[0.98] transition-all"
          >
            <Truck size={20} />
            <span>Track Order</span>
          </button>
        )}
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
