import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
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
        navigate(user.role === 'admin' ? '/admin' : '/home', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigate, user, isLoading]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 transition-colors duration-300 relative overflow-hidden">
      {/* Background decorative blurs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Logo card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="bg-white p-5 rounded-[32px] shadow-2xl mb-6 flex items-center justify-center border border-white/50"
      >
        <img src="/logo.png" alt="DryFruit Hub Logo" className="w-24 h-24 object-contain" />
      </motion.div>

      {/* Brand name */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white text-4xl font-black tracking-tight"
      >
        DryFruit Hub
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-white/75 text-sm font-medium mt-2 tracking-wide"
      >
        Premium Dry Fruits, Delivered Fresh
      </motion.p>

      {/* Bottom dots loader — subtle, not a spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-14 flex items-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-white/70 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
