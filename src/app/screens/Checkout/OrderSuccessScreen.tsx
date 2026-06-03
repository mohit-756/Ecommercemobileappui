import { useEffect } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, Package } from "lucide-react";
import { Button } from "../../components/Button";
import { motion } from "motion/react";
import confetti from "canvas-confetti";

export default function OrderSuccessScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#10B981', '#F59E0B']
    });
  }, []);

  return (
    <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center h-full">
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8"
      >
        <CheckCircle size={48} className="text-emerald-500" />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-gray-900 mb-3"
      >
        Order Successful!
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 px-4 mb-8"
      >
        Your order has been placed successfully. You will receive an email confirmation shortly.
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 rounded-2xl p-5 w-full mb-10 text-left flex items-center justify-between"
      >
        <div>
          <p className="text-sm text-gray-500 mb-1">Order ID</p>
          <p className="font-bold text-gray-900">#ORD-892471</p>
        </div>
        <Package className="text-gray-400" size={32} />
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full space-y-4 mt-auto pb-safe"
      >
        <Button fullWidth onClick={() => navigate("/order-tracking/ORD-892471")}>
          Track Order
        </Button>
        <Button variant="outline" fullWidth onClick={() => navigate("/home")}>
          Continue Shopping
        </Button>
      </motion.div>
    </div>
  );
}
