/**
 * Scanner service - manages barcode scans via backend API
 */

import * as api from './api.js';

export async function getScanHistory() {
    return await api.get('/scan/history');
}

export async function recordScan(barcode, safetyStatus = 'safe') {
    return await api.post('/scan/history', { barcode, verdict: safetyStatus });
}

export async function lookupProduct(barcode) {
    return await api.get(`/scan/lookup/${barcode}`);
}

// These endpoints are not currently exposed by the backend.
export async function searchProductsByName(query) {
    return await api.get('/scans/search', { q: query });
}

export async function getScan(scanId) {
    return await api.get(`/scans/${scanId}`);
}

export async function deleteScan(scanId) {
    return await api.del(`/scans/${scanId}`);
}

export async function getScansForDate(_userId, dateStr) {
    return await api.get(`/scans/history/${dateStr}`);
}

export async function getDayNutritionFromScans(_userId, dateStr) {
    return await api.get(`/scans/nutrition/${dateStr}`);
}
