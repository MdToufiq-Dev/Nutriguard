/**
 * Scanner service - manages barcode scans and product lookup
 */

import * as storage from './storage.js';
import { getProductByBarcode, searchProducts } from '../data/productDatabase.js';

/**
 * Get scan history for a user
 * Entity: scan_record { id, userId, barcode, productName, kcal, protein, timestamp, safetyStatus }
 */
export async function getScanHistory(userId) {
    // later: request(`/scanner/history?userId=${userId}`)
    const scans = await storage.list('scan_');
    return scans.filter(s => s.userId === userId).sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );
}

/**
 * Record a product scan
 */
export async function recordScan(userId, barcode, safetyStatus = 'safe') {
    // later: request(`/scanner/scan`, { method: 'POST', body: { barcode, safetyStatus } })
    const product = getProductByBarcode(barcode);
    if (!product) {
        throw new Error(`Product not found for barcode: ${barcode}`);
    }

    const scan = {
        id: `scan_${userId}_${Date.now()}`,
        userId,
        barcode,
        productId: product.barcode,
        productName: product.name,
        brand: product.brand,
        category: product.category,
        kcal: product.kcal,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat,
        allergens: product.allergens,
        tags: product.tags,
        safetyStatus, // 'safe' | 'warning' | 'blocked'
        timestamp: new Date().toISOString(),
    };

    await storage.set(scan.id, scan);
    return scan;
}

/**
 * Get product details by barcode
 */
export async function lookupProduct(barcode) {
    // later: request(`/scanner/lookup/${barcode}`)
    return getProductByBarcode(barcode) || null;
}

/**
 * Search products by name
 */
export async function searchProductsByName(query) {
    // later: request(`/scanner/search?q=${query}`)
    return searchProducts(query);
}

/**
 * Get scan by ID
 */
export async function getScan(scanId) {
    return await storage.get(scanId);
}

/**
 * Delete scan record
 */
export async function deleteScan(scanId) {
    await storage.remove(scanId);
    return true;
}

/**
 * Get scans for a specific date
 */
export async function getScansForDate(userId, dateStr) {
    // later: request(`/scanner/history/${dateStr}?userId=${userId}`)
    const history = await getScanHistory(userId);
    return history.filter(scan => scan.timestamp.startsWith(dateStr));
}

/**
 * Get total nutrition from scans for a date
 */
export async function getDayNutritionFromScans(userId, dateStr) {
    const scans = await getScansForDate(userId, dateStr);

    const totals = {
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        scanCount: scans.length,
    };

    scans.forEach(scan => {
        totals.kcal += scan.kcal;
        totals.protein += scan.protein;
        totals.carbs += scan.carbs;
        totals.fat += scan.fat;
    });

    return totals;
}
