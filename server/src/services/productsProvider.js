import config from '../config/env.js';
import logger from '../utils/logger.js';
import { ProductModel } from '../db/models/product.js';

// Seed product database for local / offline / test mode
export const SEED_PRODUCTS = [
  {
    barcode: '012345678901',
    name: 'Grilled Chicken Breast',
    brand: 'Tyson',
    category: 'protein',
    kcal: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    allergens: [],
    tags: ['high-protein', 'low-carb'],
  },
  {
    barcode: '012345678903',
    name: 'Wild Salmon Fillet',
    brand: 'SeaQuest',
    category: 'protein',
    kcal: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    allergens: ['fish'],
    tags: ['high-protein', 'omega-3'],
  },
  {
    barcode: '012345678904',
    name: 'Greek Yogurt Plain',
    brand: 'Fage',
    category: 'dairy',
    kcal: 59,
    protein: 10,
    carbs: 3.3,
    fat: 0.4,
    allergens: ['dairy'],
    tags: ['high-protein', 'probiotic'],
  },
  {
    barcode: '012345678905',
    name: 'Quinoa (dry)',
    brand: "Nature's Way",
    category: 'grain',
    kcal: 368,
    protein: 14,
    carbs: 64,
    fat: 6,
    allergens: [],
    tags: ['complete-protein', 'vegan'],
  },
  {
    barcode: '012345678913',
    name: 'Almonds (raw)',
    brand: 'Mauna Loa',
    category: 'nut',
    kcal: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    allergens: ['nuts'],
    tags: ['high-protein', 'vegan'],
  },
  {
    barcode: '012345678921',
    name: 'Tofu (firm)',
    brand: 'Nasoya',
    category: 'protein',
    kcal: 76,
    protein: 8.1,
    carbs: 1.9,
    fat: 4.8,
    allergens: ['soy'],
    tags: ['vegetarian', 'vegan'],
  },
];

/**
 * Fetch product from Open Food Facts API
 */
async function fetchFromOpenFoodFacts(barcode) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': config.offUserAgent,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.status !== 1 || !data.product) {
      return null;
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    const allergensRaw = (p.allergens_tags || []).map(tag =>
      tag.replace(/^[a-z]{2}:/, '').toLowerCase()
    );

    return {
      barcode,
      name: p.product_name || 'Unknown Product',
      brand: p.brands || '',
      imageUrl: p.image_url || '',
      ingredients: p.ingredients_text || '',
      kcal: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
      protein: Math.round(nutriments.proteins_100g || nutriments.proteins || 0),
      carbs: Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0),
      fat: Math.round(nutriments.fat_100g || nutriments.fat || 0),
      allergens: allergensRaw,
      tags: (p.labels_tags || []).map(l => l.replace(/^[a-z]{2}:/, '').toLowerCase()),
    };
  } catch (err) {
    logger.warn({ barcode, error: err.message }, 'Failed to fetch product from Open Food Facts');
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Get product details by barcode, checking DB first, then provider / seed, and caching result
 */
export async function getProduct(barcode) {
  // 1. Check local DB cache
  const cached = await ProductModel.getByBarcode(barcode);
  if (cached) {
    return cached;
  }

  // 2. Check seed products if provider is 'seed' or fallback
  const seedMatch = SEED_PRODUCTS.find(p => p.barcode === barcode);
  if (seedMatch) {
    await ProductModel.upsert(seedMatch);
    return await ProductModel.getByBarcode(barcode);
  }

  // 3. If provider is 'off', fetch from Open Food Facts API
  if (config.productsProvider === 'off') {
    const offProduct = await fetchFromOpenFoodFacts(barcode);
    if (offProduct) {
      await ProductModel.upsert(offProduct);
      return await ProductModel.getByBarcode(barcode);
    }
  }

  return null;
}
