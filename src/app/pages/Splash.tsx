import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMobileFeatures } from '../hooks/useMobileFeatures';

export function Splash() {
  useMobileFeatures();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user) {
        navigate('/home', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, user, isLoading]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen bg-gradient-to-br from-amber-500 to-orange-600 transition-colors duration-300">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="bg-white dark:bg-surface p-6 rounded-[28px] shadow-2xl mb-6"
      >
        <Leaf size={64} className="text-amber-600" strokeWidth={1.5} />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white text-4xl font-bold tracking-tight"
      >
        DryFruit Hub
      </motion.h1>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-12"
      >
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}
