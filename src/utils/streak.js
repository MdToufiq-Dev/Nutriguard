/**
 * Calculate streak from compliance log
 * Streak = consecutive 'followed' days ending today or yesterday
 */

/**
 * Helper to parse YYYY-MM-DD to local Date at midnight
 */
function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day, 0, 0, 0, 0);
    }
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Calculate current streak
 * @param {Array} complianceLog - Array of { date, status }
 * @returns {number} - Current streak count
 */
export function calculateStreak(complianceLog) {
    if (!complianceLog || !Array.isArray(complianceLog) || complianceLog.length === 0) {
        return 0;
    }

    // Build map of normalized date -> status
    const logMap = new Map();
    for (const item of complianceLog) {
        if (item && item.date) {
            const dateStr = typeof item.date === 'string' && item.date.length === 10
                ? item.date
                : formatDate(parseLocalDate(item.date));
            logMap.set(dateStr, item.status);
        }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    // If today is explicitly marked as non-followed (e.g. 'partial' or 'missed'), streak is broken (0)
    const todayStatus = logMap.get(todayStr);
    if (todayStatus && todayStatus !== 'followed') {
        return 0;
    }

    // Determine start date of streak (today if followed, or yesterday if followed and today not logged)
    let startCheckDate = null;
    if (todayStatus === 'followed') {
        startCheckDate = new Date(today);
    } else {
        const yesterdayStatus = logMap.get(yesterdayStr);
        if (yesterdayStatus === 'followed') {
            startCheckDate = new Date(yesterday);
        } else {
            return 0;
        }
    }

    let streak = 0;
    let curr = new Date(startCheckDate);

    while (true) {
        const currStr = formatDate(curr);
        const status = logMap.get(currStr);

        if (status === 'followed') {
            streak++;
            curr.setDate(curr.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Get date range for a month
 */
export function getMonthDates(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dates = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        dates.push(formatDate(new Date(d)));
    }

    return dates;
}

/**
 * Get first day of week (0-6, Sunday = 0)
 */
export function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

/**
 * Check if date is today
 */
export function isToday(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateStr === formatDate(today);
}

/**
 * Check if date is in the past
 */
export function isPast(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = parseLocalDate(dateStr);
    return target < today;
}

/**
 * Check if date is in the future
 */
export function isFuture(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = parseLocalDate(dateStr);
    return target > today;
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayString() {
    return formatDate(new Date());
}
