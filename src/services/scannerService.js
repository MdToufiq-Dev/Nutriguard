/**
 * Scanner service - manages barcode scans via backend API
 */

import * as api from './api.js';

/**
 * Get scan history for a user
 */
export async function getScanHistory(userId) {
    return await api.get(`/scan/history`, { userId });
}

/**
 * Record a product scan
 */
export async function recordScan(userId, barcode, safetyStatus = 'safe') {
    return await api.post(`/scan/history`, { userId, barcode, safetyStatus });
}

/**
 * Get product details by barcode
 */
export async function lookupProduct(barcode) {
    return await api.get(`/scan/lookup/${barcode}`);
}

/**
 * Search products by name
 */
export async function searchProductsByName(query) {
    return await api.get(`/scans/search`, { q: query });
}

/**
 * Get scan by ID
 */
export async function getScan(scanId) {
    return await api.get(`/scans/${scanId}`);
}

/**
 * Delete scan record
 */
export async function deleteScan(scanId) {
    return await api.del(`/scans/${scanId}`);
}

/**
 * Get scans for a specific date
 */
export async function getScansForDate(userId, dateStr) {
    return await api.get(`/scans/history/${dateStr}`, { userId });
}

/**
 * Get total nutrition from scans for a date
 */
export async function getDayNutritionFromScans(userId, dateStr) {
    return await api.get(`/scans/nutrition/${dateStr}`, { userId });
}
