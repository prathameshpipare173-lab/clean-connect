// Haversine distance calculation and Nominatim reverse geocoding client

/**
 * Calculate distance in km between two GPS coordinates using Haversine formula
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Sort villages by distance from user's GPS position
 */
export function sortVillagesByDistance(villages, userLat, userLng) {
  return [...villages]
    .map(v => ({ ...v, distanceKm: haversineDistance(userLat, userLng, v.lat, v.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Nominatim reverse geocoding — converts GPS to human-readable address
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CleanConnect-Panhala/2.0' }
    });
    const data = await res.json();
    return {
      displayName: data.display_name || 'Unknown Location',
      village: data.address?.village || data.address?.town || data.address?.city || 'Unknown Village',
      state: data.address?.state || 'Maharashtra',
      road: data.address?.road || '',
    };
  } catch {
    return { displayName: 'Could not detect location', village: 'Unknown', state: '', road: '' };
  }
}

/**
 * Get user's current GPS position (Promise-based wrapper)
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/**
 * Format distance for display
 */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}
