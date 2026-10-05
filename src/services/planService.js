/**
 * Plan service - manages diet plans in storage
 */

import * as storage from './storage.js';
import { activatePlan } from '../utils/planGenerator.js';

/**
 * Get all plans for a user
 * Entity: plan { id, userId, dietType, calorieTarget, days[], status, createdAt, activatedAt, startDate }
 */
export async function getPlans(userId) {
    // later: request(`/diet-plan/plans?userId=${userId}`)
    const plans = await storage.list('plan_');
    return plans.filter(p => p.userId === userId);
}

/**
 * Get active plan for a user
 */
export async function getActivePlan(userId) {
    // later: request(`/diet-plan/active?userId=${userId}`)
    const plans = await getPlans(userId);
    return plans.find(p => p.status === 'active') || null;
}

/**
 * Get plan by ID
 */
export async function getPlan(planId) {
    // later: request(`/diet-plan/${planId}`)
    return await storage.get(planId);
}

/**
 * Create a plan (save draft)
 */
export async function createPlan(plan) {
    // later: request(`/diet-plan`, { method: 'POST', body: plan })
    const entry = {
        ...plan,
        createdAt: new Date().toISOString(),
    };

    await storage.set(entry.id, entry);
    return entry;
}

/**
 * Update a plan
 */
export async function updatePlan(planId, updates) {
    // later: request(`/diet-plan/${planId}`, { method: 'PUT', body: updates })
    const plan = await getPlan(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const updated = {
        ...plan,
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    await storage.set(planId, updated);
    return updated;
}

/**
 * Activate a plan (set to active, deactivate others)
 */
export async function activateUserPlan(userId, planId, startDate) {
    // later: request(`/diet-plan/${planId}/activate`, { method: 'POST', body: { startDate } })

    // Get all user plans
    const plans = await getPlans(userId);

    // Deactivate other active plans
    for (const plan of plans) {
        if (plan.status === 'active') {
            await updatePlan(plan.id, { status: 'inactive' });
        }
    }

    // Activate this plan
    const plan = await getPlan(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const activated = activatePlan(plan, startDate);
    await storage.set(planId, activated);
    return activated;
}

/**
 * Delete a plan
 */
export async function deletePlan(planId) {
    // later: request(`/diet-plan/${planId}`, { method: 'DELETE' })
    await storage.remove(planId);
    return true;
}

/**
 * Get today's meals from active plan
 */
export async function getTodayMeals(userId) {
    // later: request(`/diet-plan/today?userId=${userId}`)
    const plan = await getActivePlan(userId);
    if (!plan) return null;

    const today = new Date().toISOString().split('T')[0];
    const day = plan.days.find(d => d.date === today);

    return day ? day.meals : null;
}

/**
 * Swap a meal in active plan
 */
export async function swapMealInPlan(userId, dayNumber, mealId, newMealId) {
    // later: request(`/diet-plan/swap-meal`, { method: 'POST', body: { dayNumber, mealId, newMealId } })
    const plan = await getActivePlan(userId);
    if (!plan) throw new Error('No active plan');

    const day = plan.days.find(d => d.dayNumber === dayNumber);
    if (!day) throw new Error(`Day ${dayNumber} not found`);

    const mealIndex = day.meals.findIndex(m => m.id === mealId);
    if (mealIndex === -1) throw new Error(`Meal ${mealId} not found`);

    // Find new meal in library
    const { mealLibrary } = await import('../data/mealLibrary.js');
    const newMeal = mealLibrary.find(m => m.id === newMealId);
    if (!newMeal) throw new Error(`New meal ${newMealId} not found`);

    // Update plan
    const updated = { ...plan };
    updated.days = plan.days.map(d => {
        if (d.dayNumber !== dayNumber) return d;

        const updatedMeals = [...d.meals];
        updatedMeals[mealIndex] = newMeal;

        return {
            ...d,
            meals: updatedMeals,
            totalKcal: updatedMeals.reduce((sum, m) => sum + m.kcal, 0),
            totalProtein: updatedMeals.reduce((sum, m) => sum + m.protein, 0),
            totalCarbs: updatedMeals.reduce((sum, m) => sum + m.carbs, 0),
            totalFat: updatedMeals.reduce((sum, m) => sum + m.fat, 0),
        };
    });

    await storage.set(plan.id, updated);
    return updated;
}
