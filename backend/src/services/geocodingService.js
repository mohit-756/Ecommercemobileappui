const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

function buildHeaders() {
  return {
    'User-Agent': 'EcommerceRetailShopApp/1.0 (demo)',
    'Accept-Language': 'en',
  };
}

export function parseNominatimAddress(data) {
  const addr = data.address || {};
  const displayName = data.display_name || '';

  const parts = displayName.split(',').map(p => p.trim());
  const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
  const state = addr.state || '';
  const postcode = addr.postcode || '';

  const ignored = [
    'india',
    postcode.toLowerCase(),
    state.toLowerCase(),
    city.toLowerCase(),
    addr.country?.toLowerCase(),
    'county',
    'district'
  ].filter(Boolean);

  const specificParts = parts.filter(part => {
    const lower = part.toLowerCase();
    return !ignored.some(word => lower.includes(word) || word.includes(lower));
  });

  let addressLine1 = '';
  let addressLine2 = '';

  if (specificParts.length > 0) {
    if (specificParts.length === 1) {
      addressLine1 = specificParts[0];
      addressLine2 = addr.suburb || addr.neighbourhood || '';
    } else if (specificParts.length === 2) {
      addressLine1 = specificParts[0];
      addressLine2 = specificParts[1];
    } else {
      const mid = Math.ceil(specificParts.length / 2);
      addressLine1 = specificParts.slice(0, mid).join(', ');
      addressLine2 = specificParts.slice(mid).join(', ');
    }
  }

  // Fallbacks if empty
  if (!addressLine1) {
    addressLine1 = [addr.house_number, addr.road].filter(Boolean).join(' ') || parts[0] || '';
  }
  if (!addressLine2) {
    addressLine2 = [addr.suburb, addr.neighbourhood, addr.village, addr.town].filter(Boolean).join(', ') || parts[1] || '';
  }

  return { addressLine1, addressLine2 };
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
  const { addressLine1, addressLine2 } = parseNominatimAddress(data);

  return {
    displayName: data.display_name,
    addressLine1,
    addressLine2,
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
    const { addressLine1, addressLine2 } = parseNominatimAddress(item);

    return {
      displayName: item.display_name,
      addressLine1,
      addressLine2,
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
