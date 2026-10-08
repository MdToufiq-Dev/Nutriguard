/**
 * Plan service - manages diet plans via backend API
 */

import * as api from './api.js';

/**
 * Get all plans for a user
 */
export async function getPlans(userId) {
    return await api.get(`/plans`, { userId });
}

/**
 * Get active plan for a user
 */
export async function getActivePlan(userId) {
    return await api.get(`/plans/active`, { userId });
}

/**
 * Get plan by ID
 */
export async function getPlan(planId) {
    return await api.get(`/plans/${planId}`);
}

/**
 * Create a plan
 */
export async function createPlan(plan) {
    return await api.post(`/plans`, plan);
}

/**
 * Update a plan
 */
export async function updatePlan(planId, updates) {
    return await api.put(`/plans/${planId}`, updates);
}

/**
 * Activate a plan
 */
export async function activateUserPlan(userId, planId, startDate) {
    return await api.post(`/plans/${planId}/activate`, { userId, startDate });
}

/**
 * Delete a plan
 */
export async function deletePlan(planId) {
    return await api.del(`/plans/${planId}`);
}

/**
 * Get today's meals from active plan
 */
export async function getTodayMeals(userId) {
    return await api.get(`/plans/today`, { userId });
}

/**
 * Swap a meal in active plan
 */
export async function swapMealInPlan(userId, dayNumber, mealId, newMealId) {
    return await api.post(`/plans/swap-meal`, { userId, dayNumber, mealId, newMealId });
}
