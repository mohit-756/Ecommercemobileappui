import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Crosshair, Loader2, X, Home, Briefcase, Map, Plus } from 'lucide-react';
import { useDeliveryLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';
import { addressService } from '../services/addressService';
import { LocationPicker } from './LocationPicker';
import { toast } from 'sonner';

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

export function LocationSelectorModal() {
  const {
    showSelector,
    setShowSelector,
    detectLocation,
    isDetecting,
    updateLocation,
    deliveryLocation
  } = useDeliveryLocation();
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (!showSelector || !user) return;
    setLoadingAddresses(true);
    addressService.getAddresses()
      .then(res => setSavedAddresses(res.data || []))
      .catch(err => console.error('Failed to load saved addresses:', err))
      .finally(() => setLoadingAddresses(false));
  }, [showSelector, user]);

  const handleSelectSavedAddress = (addr: Address) => {
    // Treat as GeocodedAddress compatible object
    updateLocation({
      displayName: `${addr.addressLine1}, ${addr.city}`,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: 'India',
      latitude: 0,
      longitude: 0,
      placeId: addr._id
    });
    setShowSelector(false);
    toast.success(`Delivery address set to: ${addr.label}`);
  };

  const handleConfirmMapLocation = (loc: any) => {
    updateLocation({
      displayName: loc.displayName,
      addressLine1: loc.addressLine1,
      addressLine2: loc.addressLine2,
      city: loc.city,
      state: loc.state,
      pincode: loc.pincode,
      country: 'India',
      latitude: loc.latitude,
      longitude: loc.longitude,
      placeId: ''
    });
    setShowMapPicker(false);
    setShowSelector(false);
    toast.success(`Location set to: ${loc.city || loc.state}`);
  };

  const getLabelIcon = (label: string) => {
    const lowercaseLabel = label.toLowerCase();
    if (lowercaseLabel === 'home') return <Home size={18} className="text-blue-500" />;
    if (lowercaseLabel === 'work') return <Briefcase size={18} className="text-amber-500" />;
    return <MapPin size={18} className="text-emerald-500" />;
  };

  return (
    <>
      <AnimatePresence>
        {showSelector && !showMapPicker && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowSelector(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
              className="relative w-full sm:max-w-md bg-white dark:bg-surface rounded-t-3xl sm:rounded-3xl px-6 pt-6 pb-8 shadow-2xl transition-colors duration-300 z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-text-primary tracking-tight">
                    Delivery Location
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-text-tertiary mt-0.5">
                    Select where you would like your order delivered
                  </p>
                </div>
                <button
                  onClick={() => setShowSelector(false)}
                  className="w-8 h-8 rounded-full bg-gray-50 dark:bg-surface-secondary flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-text-secondary hover:bg-gray-150 dark:hover:bg-border-medium transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await detectLocation();
                    setShowSelector(false);
                  }}
                  disabled={isDetecting}
                  className="w-full flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl transition-colors text-left group cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-200 dark:shadow-none">
                      {isDetecting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Crosshair size={18} />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-blue-900 dark:text-blue-200">
                        {isDetecting ? 'Detecting Location...' : 'Use Current Location'}
                      </span>
                      <p className="text-xs text-blue-600 dark:text-blue-400/80 mt-0.5">
                        Detect area automatically using GPS
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setShowMapPicker(true)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-surface-secondary/40 hover:bg-gray-50 dark:hover:bg-surface-secondary border border-gray-100 dark:border-border-light rounded-2xl transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-surface-tertiary flex items-center justify-center text-gray-500 dark:text-text-secondary">
                      <Map size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-800 dark:text-text-primary">
                        Locate on Map
                      </span>
                      <p className="text-xs text-gray-400 dark:text-text-tertiary mt-0.5">
                        Drag and pin your exact location
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Saved Addresses Section (Logged-in only) */}
              {user && (
                <div className="mt-6">
                  <h3 className="text-xs font-black text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-3 px-1">
                    Saved Addresses
                  </h3>

                  {loadingAddresses ? (
                    <div className="flex justify-center py-6">
                      <Loader2 size={24} className="animate-spin text-gray-400" />
                    </div>
                  ) : savedAddresses.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50/50 dark:bg-surface-secondary/20 rounded-2xl border border-dashed border-gray-200 dark:border-border-light p-4">
                      <p className="text-xs text-gray-400 dark:text-text-tertiary mb-2">No saved addresses found</p>
                      <button
                        onClick={() => {
                          setShowSelector(false);
                          window.location.hash = '#/addresses'; // Navigate or trigger address screen
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Add new address
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr._id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className="w-full flex items-start gap-3 p-3 bg-white dark:bg-surface-secondary/60 hover:bg-gray-50 dark:hover:bg-surface-secondary border border-gray-100 dark:border-border-light rounded-2xl transition-colors text-left cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-surface-tertiary flex items-center justify-center mt-0.5 flex-shrink-0">
                            {getLabelIcon(addr.label)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-gray-800 dark:text-text-primary capitalize">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[9px] bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-text-secondary truncate mt-0.5">
                              {addr.fullName}, {addr.addressLine1}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-text-tertiary mt-0.5">
                              {addr.city}, {addr.pincode}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-background">
          <LocationPicker
            onConfirm={handleConfirmMapLocation}
            onClose={() => setShowMapPicker(false)}
          />
        </div>
      )}
    </>
  );
}
