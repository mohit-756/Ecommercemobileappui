import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Crosshair, Loader2 } from 'lucide-react';
import { geocodingService } from '../services/geocodingService';
import { toast } from 'sonner';

// Fix Leaflet default marker icon issue with bundlers
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
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

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
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <div className="absolute top-4 left-4 z-10">
        <button onClick={onClose} className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 border border-gray-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="absolute top-4 left-16 right-4 z-10">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for an address..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl shadow-lg border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searching && (
            <Loader2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
          )}
        </div>
        {suggestions.length > 0 && (
          <div className="mt-1 bg-white rounded-2xl shadow-xl border border-gray-200 max-h-56 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-start gap-3"
              >
                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{s.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapContainerRef} className="flex-1 w-full" />

      {/* Locate me button */}
      <button
        onClick={handleLocateMe}
        className="absolute z-10 bottom-44 right-4 w-11 h-11 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
        title="Use my location"
      >
        <Crosshair size={20} />
      </button>

      {/* Bottom sheet */}
      <div className="bg-white p-5 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] rounded-t-3xl">
        {geocoding ? (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Getting address...</span>
          </div>
        ) : selectedLocation ? (
          <div className="mb-4">
            <div className="flex items-start gap-2 mb-1">
              <MapPin size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-700 line-clamp-2">{selectedLocation.displayName}</p>
            </div>
            {(selectedLocation.city || selectedLocation.state) && (
              <p className="text-xs text-gray-500 ml-6">
                {[selectedLocation.addressLine1, selectedLocation.city, selectedLocation.state, selectedLocation.pincode].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4 text-center">Tap on the map or search to select a location</p>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selectedLocation}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
