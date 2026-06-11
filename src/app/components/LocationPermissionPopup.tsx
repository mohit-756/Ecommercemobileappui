import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X } from 'lucide-react';

interface LocationPermissionPopupProps {
  open: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

export function LocationPermissionPopup({ open, onAllow, onDismiss }: LocationPermissionPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            className="relative w-full sm:max-w-sm bg-white dark:bg-surface rounded-t-3xl sm:rounded-3xl px-6 pt-8 pb-10 shadow-2xl transition-colors duration-300"
          >
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-tertiary flex items-center justify-center text-gray-400 dark:text-text-tertiary hover:text-gray-600 dark:hover:text-text-secondary hover:bg-gray-200 dark:hover:bg-border-medium transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30 mb-5">
                <MapPin size={36} className="text-white" strokeWidth={2.5} />
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-text-primary mb-2 tracking-tight">
                Enable Your Location
              </h2>

              <p className="text-gray-500 dark:text-text-secondary text-sm leading-relaxed mb-8 max-w-xs">
                Allow location access to discover nearby stores, faster delivery options, and personalized recommendations.
              </p>

              <button
                onClick={onAllow}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-200/60 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-200"
              >
                Allow Location Access
              </button>

              <button
                onClick={onDismiss}
                className="mt-3 text-gray-400 dark:text-text-tertiary font-medium text-sm py-3 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-secondary hover:text-gray-600 dark:hover:text-text-secondary active:scale-95 transition-all duration-200"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
