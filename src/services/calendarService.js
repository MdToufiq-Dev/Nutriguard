/**
 * Calendar service - manages compliance log entries via backend API
 */

import * as api from './api.js';

/**
 * Get compliance log for a user
 */
export async function getComplianceLog() {
    return await api.get(`/calendar/compliance`);
}

/**
 * Get compliance status for a specific date
 */
export async function getComplianceForDate(date) {
    return await api.get(`/calendar/compliance/${date}`);
}

/**
 * Set compliance status for a date
 */
export async function setCompliance(date, status) {
    return await api.post(`/calendar/compliance`, { date, status });
}

/**
 * Delete compliance entry
 */
export async function deleteCompliance(date) {
    return await api.del(`/calendar/compliance/${date}`);
}
