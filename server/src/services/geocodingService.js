import NodeCache from 'node-cache';
import config from '../config/env.js';
import logger from '../utils/logger.js';

const cache = new NodeCache({ stdTTL: 24 * 3600 }); // 24 hours cache

/**
 * Geocode address to lat/lng using Nominatim
 */
export async function geocodeAddress(address) {
  const cacheKey = `geo_${address.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': config.osmUserAgent },
    });
    if (!res.ok) throw new Error('Geocoding service failed');

    const data = await res.json();
    if (data.length === 0) return null;

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      address: data[0].display_name,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.error({ error: err.message }, 'Failed to geocode address');
    return null;
  }
}
