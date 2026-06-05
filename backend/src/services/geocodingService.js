const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

function buildHeaders() {
  return {
    'User-Agent': 'EcommerceRetailShopApp/1.0 (demo)',
    'Accept-Language': 'en',
  };
}

export async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return null;
  const params = new URLSearchParams({
    format: 'json',
    lat,
    lon: lng,
    addressdetails: 1,
    limit: 1,
  });

  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: buildHeaders(),
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data || !data.address) return null;

  const addr = data.address;
  return {
    displayName: data.display_name,
    addressLine1: [addr.house_number, addr.road].filter(Boolean).join(' ') || addr.display_name?.split(',')[0]?.trim() || '',
    addressLine2: [addr.suburb, addr.neighbourhood, addr.village, addr.town].filter(Boolean).join(', '),
    city: addr.city || addr.town || addr.village || addr.county || addr.state_district || '',
    state: addr.state || '',
    pincode: addr.postcode || '',
    country: addr.country || '',
    latitude: parseFloat(lat),
    longitude: parseFloat(lng),
    placeId: data.place_id?.toString() || '',
  };
}

export async function searchAddresses(query) {
  if (!query || query.trim().length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: 1,
    limit: 8,
  });

  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: buildHeaders(),
  });

  if (!res.ok) return [];

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    const addr = item.address || {};
    return {
      displayName: item.display_name,
      addressLine1: [addr.house_number, addr.road].filter(Boolean).join(' ') || item.display_name?.split(',')[0]?.trim() || '',
      addressLine2: [addr.suburb, addr.neighbourhood, addr.village, addr.town].filter(Boolean).join(', '),
      city: addr.city || addr.town || addr.village || addr.county || addr.state_district || '',
      state: addr.state || '',
      pincode: addr.postcode || '',
      country: addr.country || '',
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      placeId: item.place_id?.toString() || '',
    };
  });
}
