/**
 * Plan generator - pure logic for building personalized diet plans
 * Input: user preferences + health profile + constraints
 * Output: 7-day meal plan matching calorie/macro targets
 */

import { mealLibrary } from '../data/mealLibrary.js';

/**
 * Generate a 7-day diet plan
 * @param {Object} params
 * @param {string} params.dietType - 'high-protein' | 'mediterranean' | 'vegetarian' | 'vegan' | 'keto'
 * @param {number} params.calorieTarget - Daily calorie goal
 * @param {string[]} params.allergens - Allergens to avoid
 * @param {string[]} params.dislikedFoods - Foods to exclude
 * @param {string} params.userId - User ID for plan ownership
 * @returns {Object} Plan with metadata and 7 days of meals
 */
export function generatePlan({
    dietType,
    calorieTarget,
    allergens = [],
    dislikedFoods = [],
    userId
}) {
    // Filter meals by diet type and allergens
    const availableMeals = filterMeals(mealLibrary, dietType, allergens, dislikedFoods);

    // Build 7-day plan
    const days = [];
    for (let i = 0; i < 7; i++) {
        const dayMeals = selectDayMeals(availableMeals, calorieTarget, i);
        days.push({
            dayNumber: i + 1,
            date: null, // Will be set when plan is activated
            meals: dayMeals,
            totalKcal: dayMeals.reduce((sum, m) => sum + m.kcal, 0),
            totalProtein: dayMeals.reduce((sum, m) => sum + m.protein, 0),
            totalCarbs: dayMeals.reduce((sum, m) => sum + m.carbs, 0),
            totalFat: dayMeals.reduce((sum, m) => sum + m.fat, 0),
        });
    }

    return {
        id: `plan_${userId}_${Date.now()}`,
        userId,
        dietType,
        calorieTarget,
        allergens,
        dislikedFoods,
        days,
        createdAt: new Date().toISOString(),
        status: 'draft', // 'draft' | 'active' | 'completed'
    };
}

/**
 * Filter meals by diet type, allergens, and dislikes
 */
function filterMeals(meals, dietType, allergens, dislikedFoods) {
    return meals.filter(meal => {
        // Check diet tags
        const matchesDiet = dietType === 'any' || meal.dietTags.includes(dietType);
        if (!matchesDiet) return false;

        // Check allergens
        const hasAllergen = allergens.some(allergen =>
            meal.allergens.includes(allergen)
        );
        if (hasAllergen) return false;

        // Check dislikes
        const isDisliked = dislikedFoods.some(food =>
            meal.name.toLowerCase().includes(food.toLowerCase()) ||
            meal.description.toLowerCase().includes(food.toLowerCase())
        );
        if (isDisliked) return false;

        return true;
    });
}

/**
 * Select meals for a single day to match calorie target
 * Uses a greedy algorithm with variety constraints
 */
function selectDayMeals(availableMeals, calorieTarget, dayIndex) {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const selectedMeals = [];
    let currentCalories = 0;

    // Target distribution: breakfast 25%, lunch 35%, dinner 35%, snack 5%
    const typeTargets = {
        breakfast: calorieTarget * 0.25,
        lunch: calorieTarget * 0.35,
        dinner: calorieTarget * 0.35,
        snack: calorieTarget * 0.05,
    };

    for (const type of mealTypes) {
        const typeMeals = availableMeals.filter(m => m.mealType === type);
        if (typeMeals.length === 0) continue;

        // Pick a meal close to target calories for this type
        const target = typeTargets[type];
        const meal = pickClosestMeal(typeMeals, target, dayIndex);

        if (meal) {
            selectedMeals.push(meal);
            currentCalories += meal.kcal;
        }
    }

    // If under target by >200 cal, add another snack
    if (currentCalories < calorieTarget - 200) {
        const snacks = availableMeals.filter(m => m.mealType === 'snack');
        if (snacks.length > 0) {
            const extraSnack = pickClosestMeal(
                snacks,
                calorieTarget - currentCalories,
                dayIndex + 100 // Offset to ensure different snack
            );
            if (extraSnack && !selectedMeals.find(m => m.id === extraSnack.id)) {
                selectedMeals.push(extraSnack);
            }
        }
    }

    return selectedMeals;
}

/**
 * Pick meal closest to target calories with pseudo-random variety
 */
function pickClosestMeal(meals, targetCalories, seed) {
    if (meals.length === 0) return null;

    // Sort by calorie difference
    const sorted = [...meals].sort((a, b) => {
        const diffA = Math.abs(a.kcal - targetCalories);
        const diffB = Math.abs(b.kcal - targetCalories);
        return diffA - diffB;
    });

    // Pick from top 3 candidates using seed for variety
    const candidates = sorted.slice(0, Math.min(3, sorted.length));
    const index = seed % candidates.length;
    return candidates[index];
}

/**
 * Swap a meal in an existing plan
 * @param {Object} plan - Current plan
 * @param {number} dayNumber - Day to swap (1-7)
 * @param {string} mealId - ID of meal to replace
 * @returns {Object} Updated plan
 */
export function swapMeal(plan, dayNumber, mealId) {
    const day = plan.days.find(d => d.dayNumber === dayNumber);
    if (!day) return plan;

    const mealIndex = day.meals.findIndex(m => m.id === mealId);
    if (mealIndex === -1) return plan;

    const oldMeal = day.meals[mealIndex];
    const availableMeals = filterMeals(
        mealLibrary,
        plan.dietType,
        plan.allergens,
        plan.dislikedFoods
    );

    // Find alternatives of same type, excluding current meal
    const alternatives = availableMeals.filter(
        m => m.mealType === oldMeal.mealType && m.id !== oldMeal.id
    );

    if (alternatives.length === 0) return plan;

    // Pick closest calorie match
    const newMeal = pickClosestMeal(alternatives, oldMeal.kcal, dayNumber);

    // Update plan
    const updatedPlan = { ...plan };
    updatedPlan.days = plan.days.map(d => {
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

    return updatedPlan;
}

/**
 * Activate a plan (set start date and status)
 */
export function activatePlan(plan, startDate) {
    const activated = { ...plan };
    activated.status = 'active';
    activated.startDate = startDate;
    activated.activatedAt = new Date().toISOString();

    // Set dates for each day
    const start = new Date(startDate);
    activated.days = plan.days.map((day, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return {
            ...day,
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
        };
    });

    return activated;
}

/**
 * Get current day's meals from active plan
 */
export function getTodayMeals(plan) {
    if (!plan || plan.status !== 'active') return null;

    const today = new Date().toISOString().split('T')[0];
    const day = plan.days.find(d => d.date === today);

    return day ? day.meals : null;
}

/**
 * Calculate plan summary statistics
 */
export function calculatePlanStats(plan) {
    const avgKcal = plan.days.reduce((sum, d) => sum + d.totalKcal, 0) / plan.days.length;
    const avgProtein = plan.days.reduce((sum, d) => sum + d.totalProtein, 0) / plan.days.length;
    const avgCarbs = plan.days.reduce((sum, d) => sum + d.totalCarbs, 0) / plan.days.length;
    const avgFat = plan.days.reduce((sum, d) => sum + d.totalFat, 0) / plan.days.length;

    const totalCost = plan.days.reduce((sum, d) =>
        sum + d.meals.reduce((mealSum, m) => mealSum + m.cost, 0), 0
    );

    return {
        avgKcal: Math.round(avgKcal),
        avgProtein: Math.round(avgProtein),
        avgCarbs: Math.round(avgCarbs),
        avgFat: Math.round(avgFat),
        totalCost: Math.round(totalCost * 100) / 100,
        weeklyCost: Math.round(totalCost * 100) / 100,
    };
}
