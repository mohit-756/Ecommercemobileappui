import api from './api';

export interface GeocodedAddress {
  displayName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export const geocodingService = {
  reverseGeocode: (lat: number, lng: number) =>
    api.get<GeocodedAddress>('/geocode/reverse', { params: { lat, lng } }),

  searchAddresses: (q: string) =>
    api.get<GeocodedAddress[]>('/geocode/search', { params: { q } }),
};
