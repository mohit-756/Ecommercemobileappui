import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { geocodingService, type GeocodedAddress } from '../services/geocodingService';
import { toast } from 'sonner';

interface LocationContextType {
  deliveryLocation: string;
  addressDetails: GeocodedAddress | null;
  isDetecting: boolean;
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
  detectLocation: () => Promise<void>;
  updateLocation: (address: GeocodedAddress | string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    return localStorage.getItem('delivery_location') || 'Mumbai, India';
  });
  const [addressDetails, setAddressDetails] = useState<GeocodedAddress | null>(() => {
    const saved = localStorage.getItem('delivery_address_details');
    return saved ? JSON.parse(saved) : null;
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const checkPermissionAndDetect = async () => {
      try {
        let isGranted = false;
        if (Capacitor.isNativePlatform()) {
          const permission = await Geolocation.checkPermissions();
          isGranted = permission.location === 'granted';
        } else if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          isGranted = result.state === 'granted';
        }

        if (isGranted) {
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 5000,
          });
          const res = await geocodingService.reverseGeocode(position.coords.latitude, position.coords.longitude);
          const addr = res.data;
          if (addr) {
            const displayName = addr.addressLine2 || addr.city || addr.displayName || 'Mumbai, India';
            const parts = displayName.split(',').map(p => p.trim());
            const shortName = parts.slice(0, 2).join(', ');
            setDeliveryLocation(shortName);
            localStorage.setItem('delivery_location', shortName);
            setAddressDetails(addr);
            localStorage.setItem('delivery_address_details', JSON.stringify(addr));
          }
        }
      } catch (err) {
        console.error('Silent auto-location detection on mount failed:', err);
      }
    };
    checkPermissionAndDetect();
  }, []);

  const updateLocation = (address: GeocodedAddress | string) => {
    if (typeof address === 'string') {
      setDeliveryLocation(address);
      localStorage.setItem('delivery_location', address);
      setAddressDetails(null);
      localStorage.removeItem('delivery_address_details');
    } else {
      // Create a nice display name: e.g. "Bandra, Mumbai" or "Saket, Delhi"
      const displayName = address.addressLine2 || address.city || address.displayName || 'Mumbai, India';
      // Limit to 2 parts for brevity in header
      const parts = displayName.split(',').map(p => p.trim());
      const shortName = parts.slice(0, 2).join(', ');

      setDeliveryLocation(shortName);
      localStorage.setItem('delivery_location', shortName);
      setAddressDetails(address);
      localStorage.setItem('delivery_address_details', JSON.stringify(address));
    }
  };

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            toast.error('Location permission denied. Please select manually.');
            setIsDetecting(false);
            return;
          }
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const res = await geocodingService.reverseGeocode(position.coords.latitude, position.coords.longitude);
      const addr = res.data;
      updateLocation(addr);
      toast.success(`Location set to: ${addr.city || addr.state}`);
    } catch (err: any) {
      console.error('Failed to detect location:', err);
      let errorMsg = 'Could not detect location. Please select manually.';
      if (err.code === 1 || err.message?.includes('denied') || err.message?.includes('Permission') || err.message?.includes('permission')) {
        errorMsg = 'Location permission denied. Please enable location access in browser settings or select manually.';
      } else if (err.code === 3 || err.message?.includes('timeout') || err.message?.includes('Timeout')) {
        errorMsg = 'Location detection timed out. Please select manually.';
      } else if (err.response) {
        errorMsg = `Geocoding service error (${err.response.status}). Please select manually.`;
      } else if (err.request) {
        errorMsg = 'Cannot connect to backend server. Please check your connection or select manually.';
      }
      toast.error(errorMsg);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <LocationContext.Provider value={{
      deliveryLocation,
      addressDetails,
      isDetecting,
      showSelector,
      setShowSelector,
      detectLocation,
      updateLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useDeliveryLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useDeliveryLocation must be used within LocationProvider');
  return context;
}
