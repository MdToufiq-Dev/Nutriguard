import config from '../config/env.js';
import logger from '../utils/logger.js';
import { calculateDistance } from '../utils/mapUtils.js';

/**
 * Query Overpass API for OSM places
 */
export async function fetchFromOverpass(lat, lng, radiusKm) {
  const radiusMeters = Math.min(radiusKm * 1000, 10000);
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
      node["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
      node["amenity"="fast_food"](around:${radiusMeters},${lat},${lng});
    );
    out body 20;
  `;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const url = `${config.overpassEndpoints}?data=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': config.osmUserAgent },
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.elements) return null;

    return data.elements.map(el => {
      const tags = el.tags || {};
      const dietSupport = [];
      if (tags['diet:vegan'] === 'yes' || tags['diet:vegan'] === 'only') dietSupport.push('vegan');
      if (tags['diet:vegetarian'] === 'yes' || tags['diet:vegetarian'] === 'only') dietSupport.push('vegetarian');
      if (tags['diet:gluten_free'] === 'yes') dietSupport.push('gluten-free');

      return {
        id: `osm_${el.id}`,
        name: tags.name || tags['name:en'] || 'Local Eatery',
        cuisine: tags.cuisine || 'general',
        rating: 4.5,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        minOrder: 15,
        address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean).join(' ') || 'Nearby Location',
        priceRange: 2,
        lat: el.lat,
        lng: el.lon,
        distance: calculateDistance(lat, lng, el.lat, el.lon),
        dietSupport: dietSupport.length > 0 ? dietSupport : ['any'],
        allergenInfo: ['gluten-free-options'],
        popularMeals: [],
        isOpen: true,
      };
    });
  } catch (err) {
    logger.warn({ error: err.message }, 'Failed to fetch from Overpass API');
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
