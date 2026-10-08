/**
 * Calendar service - manages compliance log entries via backend API
 */

import * as api from './api.js';

/**
 * Get compliance log for a user
 */
export async function getComplianceLog(userId) {
    return await api.get(`/calendar/compliance`, { userId });
}

/**
 * Get compliance status for a specific date
 */
export async function getComplianceForDate(userId, date) {
    return await api.get(`/calendar/compliance/${date}`, { userId });
}

/**
 * Set compliance status for a date
 */
export async function setCompliance(userId, date, status) {
    return await api.post(`/calendar/compliance`, { userId, date, status });
}

/**
 * Delete compliance entry
 */
export async function deleteCompliance(userId, date) {
    return await api.del(`/calendar/compliance/${date}`);
}
