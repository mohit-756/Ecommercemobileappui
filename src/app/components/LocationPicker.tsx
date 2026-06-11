import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Crosshair, Loader2, ChevronLeft } from 'lucide-react';
import { geocodingService } from '../services/geocodingService';
import { toast } from 'sonner';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

interface LocationData {
  latitude: number;
  longitude: number;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  displayName: string;
}

interface LocationPickerProps {
  onConfirm: (location: LocationData) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

const defaultCenter: [number, number] = [28.6139, 77.2090];

export function LocationPicker({ onConfirm, onClose, initialLat, initialLng }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center: [number, number] = (initialLat && initialLng)
      ? [initialLat, initialLng]
      : defaultCenter;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(center, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const marker = L.marker(center, { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      reverseGeocodeAt(pos.lat, pos.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      reverseGeocodeAt(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    if (initialLat && initialLng) {
      reverseGeocodeAt(initialLat, initialLng);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  async function reverseGeocodeAt(lat: number, lng: number) {
    setGeocoding(true);
    try {
      const res = await geocodingService.reverseGeocode(lat, lng);
      const data = res.data;
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        displayName: data.displayName,
      });
    } catch {
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    } finally {
      setGeocoding(false);
    }
  }

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await geocodingService.searchAddresses(q);
      setSuggestions(res.data);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }

  function handleSelectSuggestion(suggestion: any) {
    setSearchQuery(suggestion.displayName || suggestion.addressLine1);
    setSuggestions([]);
    const lat = suggestion.latitude;
    const lng = suggestion.longitude;
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
    setSelectedLocation({
      latitude: lat,
      longitude: lng,
      addressLine1: suggestion.addressLine1,
      addressLine2: suggestion.addressLine2,
      city: suggestion.city,
      state: suggestion.state,
      pincode: suggestion.pincode,
      displayName: suggestion.displayName,
    });
  }

  function handleLocateMe() {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocodeAt(latitude, longitude);
      },
      () => toast.error('Could not get your location. Please search manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleConfirm() {
    if (!selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }
    onConfirm(selectedLocation);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-surface transition-colors duration-300"
    >
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/90 dark:bg-surface/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-900 dark:text-text-primary border border-gray-200/80 dark:border-border-light active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="absolute top-4 left-16 right-4 z-10">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for an address..."
            className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-surface/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80 dark:border-border-light text-gray-900 dark:text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-surface transition-all"
          />
          {searching && (
            <Loader2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary animate-spin" />
          )}
        </div>
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1 bg-white dark:bg-surface rounded-2xl shadow-xl border border-gray-200 dark:border-border-medium max-h-56 hide-scrollbar overflow-y-auto"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-text-primary hover:bg-gray-50 dark:hover:bg-surface-secondary border-b border-gray-100 dark:border-border-light last:border-0 flex items-start gap-3 active:bg-gray-100 dark:active:bg-surface-tertiary transition-colors"
                >
                  <MapPin size={16} className="text-gray-400 dark:text-text-tertiary mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{s.displayName}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={mapContainerRef} className="flex-1 w-full" />

      <button
        onClick={handleLocateMe}
        className="absolute z-10 bottom-48 right-4 w-11 h-11 bg-white dark:bg-surface rounded-full shadow-lg border border-gray-200 dark:border-border-medium flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 active:scale-90 transition-all"
        title="Use my location"
      >
        <Crosshair size={20} />
      </button>

      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-surface px-5 pt-4 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] rounded-t-3xl transition-colors duration-300"
      >
        {geocoding ? (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-500 dark:text-text-secondary">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-medium">Getting address...</span>
          </div>
        ) : selectedLocation ? (
          <div className="mb-4 px-1">
            <div className="flex items-start gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-text-primary line-clamp-1">{selectedLocation.displayName}</p>
                {(selectedLocation.city || selectedLocation.state) && (
                  <p className="text-xs text-gray-500 dark:text-text-secondary mt-0.5 line-clamp-1">
                    {[selectedLocation.addressLine1, selectedLocation.city, selectedLocation.state, selectedLocation.pincode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-surface-secondary flex items-center justify-center mb-2">
              <MapPin size={18} className="text-gray-300 dark:text-text-tertiary" />
            </div>
            <p className="text-xs text-gray-400 dark:text-text-tertiary font-medium">Tap on the map or search to select a location</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selectedLocation}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200"
        >
          Confirm Location
        </button>
      </motion.div>
    </motion.div>
  );
}
