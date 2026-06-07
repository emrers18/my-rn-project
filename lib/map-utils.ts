const geocodeCache: Record<string, { latitude: number; longitude: number }> = {};

/**
 * Geocodes a place name to coordinates using OpenStreetMap Nominatim API.
 * Uses a local memory cache to prevent redundant API queries.
 */
export async function geocodeLocation(
  query: string
): Promise<{ latitude: number; longitude: number } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  if (geocodeCache[trimmed]) {
    return geocodeCache[trimmed];
  }

  try {
    // Nominatim usage policy requires a specific User-Agent
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TravelBotApp/1.0 (contact: support@travelbot.example.com)',
      },
    });

    if (!response.ok) {
      console.warn('Geocoding request failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        const coords = { latitude: lat, longitude: lon };
        geocodeCache[trimmed] = coords;
        return coords;
      }
    }
  } catch (error) {
    console.error('Error during geocoding:', error);
  }

  return null;
}
