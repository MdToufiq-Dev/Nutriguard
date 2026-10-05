/**
 * Integration stub for health sync data
 * TODO(coworker): replace with real implementation
 *
 * Returns synced health data from devices/apps (Apple Health, Google Fit, etc.)
 */

export async function getHealthSyncSummary() {
    // Mock health sync data for development
    // null values indicate data not available/not synced
    return {
        activeMinutes: null, // e.g., 67
        caloriesBurned: null, // e.g., 342
    };
}
