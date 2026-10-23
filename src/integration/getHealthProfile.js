import { get } from '../services/api.js';

/**
 * Load the authenticated user's health profile for feature integrations.
 */
export async function getHealthProfile() {
    try {
        const response = await get('/auth/medical-profile');
        const profile = response?.medicalProfile || response;
        return {
            allergies: profile?.diseases ? profile.diseases.split(',').map(value => value.trim()).filter(Boolean) : [],
            conditions: profile?.diseases ? profile.diseases.split(',').map(value => value.trim()).filter(Boolean) : [],
            dietType: null,
            calorieTarget: null,
            ...profile,
        };
    } catch (error) {
        // A profile is optional during onboarding; feature screens can use defaults.
        if (error.message.includes('not found') || error.message.includes('HTTP 404')) return {};
        throw error;
    }
}
