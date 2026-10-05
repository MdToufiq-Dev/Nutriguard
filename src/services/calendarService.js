/**
 * Calendar service - manages compliance log entries
 */

import * as storage from './storage.js';

/**
 * Get compliance log for a user
 * Entity: compliance_log { id, userId, date, status }
 * Status: 'followed' | 'partial' | 'missed'
 */
export async function getComplianceLog(userId) {
    // later: request(`/calendar/compliance?userId=${userId}`)
    const logs = await storage.list('compliance_');
    return logs.filter(log => log.userId === userId);
}

/**
 * Get compliance status for a specific date
 */
export async function getComplianceForDate(userId, date) {
    // later: request(`/calendar/compliance/${date}?userId=${userId}`)
    const logs = await getComplianceLog(userId);
    return logs.find(log => log.date === date) || null;
}

/**
 * Set compliance status for a date
 */
export async function setCompliance(userId, date, status) {
    // later: request(`/calendar/compliance`, { method: 'POST', body: { userId, date, status } })
    const existing = await getComplianceForDate(userId, date);

    const entry = {
        id: existing?.id || `compliance_${userId}_${date}`,
        userId,
        date, // ISO format YYYY-MM-DD
        status, // 'followed' | 'partial' | 'missed'
        updatedAt: new Date().toISOString(),
    };

    await storage.set(entry.id, entry);
    return entry;
}

/**
 * Delete compliance entry
 */
export async function deleteCompliance(userId, date) {
    // later: request(`/calendar/compliance/${date}`, { method: 'DELETE' })
    const existing = await getComplianceForDate(userId, date);
    if (existing) {
        await storage.remove(existing.id);
    }
    return true;
}
