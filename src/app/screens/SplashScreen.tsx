import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex-1 bg-blue-600 flex flex-col items-center justify-center h-full w-full">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white dark:bg-surface p-6 rounded-3xl shadow-2xl mb-6"
      >
        <ShoppingBag size={64} className="text-blue-600" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-white text-4xl font-bold tracking-tight"
      >
        Lumina
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-blue-100 mt-2 font-medium"
      >
        Premium Retail Experience
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-12 flex space-x-2"
      >
        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
      </motion.div>
    </div>
  );
}
