/**
 * Calculate streak from compliance log
 * Streak = consecutive 'followed' days ending today or yesterday
 */

/**
 * Calculate current streak
 * @param {Array} complianceLog - Array of { date, status } sorted by date desc
 * @returns {number} - Current streak count
 */
export function calculateStreak(complianceLog) {
    if (!complianceLog || complianceLog.length === 0) {
        return 0;
    }

    // Sort by date descending
    const sorted = [...complianceLog].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    // Find most recent 'followed' entry
    const mostRecent = sorted.find(log => log.status === 'followed');
    if (!mostRecent) {
        return 0;
    }

    // Streak must end today or yesterday
    if (mostRecent.date !== todayStr && mostRecent.date !== yesterdayStr) {
        return 0;
    }

    // Count consecutive 'followed' days
    let streak = 0;
    let currentDate = new Date(mostRecent.date);

    for (const log of sorted) {
        const logDate = formatDate(currentDate);

        if (log.date === logDate && log.status === 'followed') {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (log.date === logDate) {
            // Found a non-followed day, streak ends
            break;
        }
    }

    return streak;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    const date = new Date(dateStr);
    return date < today;
}

/**
 * Check if date is in the future
 */
export function isFuture(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date > today;
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayString() {
    return formatDate(new Date());
}
