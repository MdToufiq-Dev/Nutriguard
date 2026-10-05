/**
 * Integration stub for health profile
 * TODO(coworker): replace with real implementation
 *
 * Returns user's health profile including allergies, conditions, and diet preferences
 */

export async function getHealthProfile() {
    // Mock health profile data for development
    // Edit this to test scanner safety evaluator with different profiles
    return {
        allergies: [], // e.g., ['peanuts', 'shellfish']
        conditions: [], // e.g., ['diabetes', 'hypertension']
        dietType: null, // e.g., 'vegetarian', 'vegan', 'halal'
        calorieTarget: null, // e.g., 2000
    };
}
