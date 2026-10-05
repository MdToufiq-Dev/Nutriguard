import NodeCache from 'node-cache';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import { RestaurantModel } from '../db/models/restaurant.js';

const cache = new NodeCache({ stdTTL: config.placesCacheTtlHours * 3600 });

export const SEED_RESTAURANTS = [
  {
    id: 'rest_001',
    name: 'GreenLeaf Kitchen',
    cuisine: 'healthy',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minOrder: 15,
    address: '123 Healthy Way, City Center',
    priceRange: 2,
    lat: 40.7128,
    lng: -74.0060,
    dietSupport: ['vegetarian', 'vegan', 'keto', 'high-protein'],
    allergenInfo: ['nut-free-options', 'gluten-free-options', 'dairy-free-options'],
    popularMeals: [
      { id: 'meal_gl_001', name: 'Buddha Bowl', kcal: 485, price: 12.99, dietary: ['vegan', 'gluten-free'] },
      { id: 'meal_gl_002', name: 'Grilled Salmon', kcal: 520, price: 16.99, dietary: ['keto', 'paleo'] },
      { id: 'meal_gl_003', name: 'Quinoa Salad', kcal: 420, price: 11.99, dietary: ['vegetarian', 'vegan'] },
    ],
    isOpen: true,
    hours: '10:00 AM - 10:00 PM',
  },
  {
    id: 'rest_002',
    name: 'Protein House',
    cuisine: 'fitness',
    rating: 4.6,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 12,
    address: '45 Muscle Blvd, Downtown',
    priceRange: 2,
    lat: 40.7138,
    lng: -74.0070,
    dietSupport: ['high-protein', 'keto', 'paleo'],
    allergenInfo: ['nut-free', 'gluten-free-options'],
    popularMeals: [
      { id: 'meal_ph_001', name: 'Chicken & Rice', kcal: 650, price: 13.99, dietary: ['high-protein'] },
      { id: 'meal_ph_002', name: 'Beef Steak Bowl', kcal: 720, price: 15.99, dietary: ['keto', 'high-protein'] },
    ],
    isOpen: true,
    hours: '7:00 AM - 9:00 PM',
  },
  {
    id: 'rest_003',
    name: 'Mediterranean Grill',
    cuisine: 'mediterranean',
    rating: 4.7,
    deliveryTime: '30-40 min',
    deliveryFee: 3.99,
    minOrder: 18,
    address: '78 Olive Grove Lane',
    priceRange: 3,
    lat: 40.7118,
    lng: -74.0050,
    dietSupport: ['mediterranean', 'vegetarian', 'vegan', 'keto'],
    allergenInfo: ['nut-free-options', 'gluten-free', 'dairy-free-options'],
    popularMeals: [
      { id: 'meal_mg_001', name: 'Falafel Wrap', kcal: 480, price: 11.99, dietary: ['vegetarian', 'vegan'] },
      { id: 'meal_mg_002', name: 'Greek Salad', kcal: 380, price: 10.99, dietary: ['vegetarian'] },
    ],
    isOpen: true,
    hours: '11:00 AM - 11:00 PM',
  },
  {
    id: 'rest_006',
    name: 'Vegan Vibes',
    cuisine: 'vegan',
    rating: 4.9,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    minOrder: 13,
    address: '92 Plant Avenue',
    priceRange: 2,
    lat: 40.7168,
    lng: -74.0100,
    dietSupport: ['vegan', 'vegetarian', 'raw'],
    allergenInfo: ['nut-free-options', 'gluten-free', 'soy-free-options'],
    popularMeals: [
      { id: 'meal_vv_001', name: 'Acai Bowl', kcal: 380, price: 10.99, dietary: ['vegan'] },
      { id: 'meal_vv_002', name: 'Chickpea Curry', kcal: 450, price: 12.99, dietary: ['vegan'] },
    ],
    isOpen: true,
    hours: '9:00 AM - 9:00 PM',
  },
];

/**
 * Haversine formula to compute distance in km between two lat/lng coordinates
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Query Overpass API for OSM places
 */
async function fetchFromOverpass(lat, lng, radiusKm) {
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

/**
 * Get nearby restaurants with filtering & sorting
 */
export async function getNearbyPlaces(lat, lng, filters = {}) {
  const {
    radius = 5,
    dietType = 'any',
    priceRange,
    sortBy = 'distance',
  } = filters;

  const cacheKey = `places_${lat}_${lng}_${radius}_${dietType}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let places = [];

  // Try OSM if configured
  if (config.placesProvider === 'osm') {
    const osmPlaces = await fetchFromOverpass(lat, lng, radius);
    if (osmPlaces && osmPlaces.length > 0) {
      places = osmPlaces;
    }
  }

  // Fallback to seed/mock restaurants
  if (places.length === 0) {
    places = SEED_RESTAURANTS.map(r => ({
      ...r,
      distance: calculateDistance(lat, lng, r.lat, r.lng),
    }));
  }

  // Filter by distance/radius
  places = places.filter(r => r.distance <= radius);

  // Filter by dietType
  if (dietType && dietType !== 'any') {
    places = places.filter(r => r.dietSupport && r.dietSupport.includes(dietType));
  }

  // Filter by priceRange
  if (priceRange) {
    places = places.filter(r => r.priceRange <= Number(priceRange));
  }

  // Sort
  if (sortBy === 'rating') {
    places.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'delivery-time') {
    places.sort((a, b) => {
      const timeA = parseInt(a.deliveryTime.split('-')[0], 10);
      const timeB = parseInt(b.deliveryTime.split('-')[0], 10);
      return timeA - timeB;
    });
  } else {
    // Default sort by distance
    places.sort((a, b) => a.distance - b.distance);
  }

  cache.set(cacheKey, places);
  return places;
}

/**
 * Get restaurant by ID
 */
export async function getPlaceById(id) {
  const seed = SEED_RESTAURANTS.find(r => r.id === id);
  if (seed) return seed;

  const dbPlace = await RestaurantModel.getById(id);
  return dbPlace;
}
