/**
 * Plan service - manages diet plans via backend API
 */

import * as api from './api.js';

/**
 * Get all plans for a user
 */
export async function getPlans() {
    return await api.get(`/plans`);
}

/**
 * Get active plan for a user
 */
export async function getActivePlan() {
    return await api.get(`/plans/active`);
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
export async function activateUserPlan(planId, startDate) {
    return await api.post(`/plans/${planId}/activate`, { startDate });
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
export async function getTodayMeals() {
    return await api.get(`/plans/today`);
}

/**
 * Swap a meal in active plan
 */
export async function swapMealInPlan(dayNumber, mealId, newMeal) {
    return await api.post(`/plans/swap-meal`, { dayNumber, mealId, newMeal });
}

/**
 * Clear the active plan
 */
export async function clearPlan() {
    return await api.post(`/plans/clear`);
}
