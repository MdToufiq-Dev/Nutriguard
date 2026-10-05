import { describe, it, expect } from 'vitest';
import {
    generatePlan,
    swapMeal,
    activatePlan,
    getTodayMeals,
    calculatePlanStats,
} from '../utils/planGenerator';
import { mealLibrary } from '../data/mealLibrary';

describe('planGenerator', () => {
    const mockUserId = 'test-user-123';

    describe('generatePlan', () => {
        it('should generate a 7-day plan', () => {
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                userId: mockUserId,
            });

            expect(plan).toBeDefined();
            expect(plan.days).toHaveLength(7);
            expect(plan.userId).toBe(mockUserId);
            expect(plan.dietType).toBe('high-protein');
            expect(plan.calorieTarget).toBe(2000);
            expect(plan.status).toBe('draft');
        });

        it('should include breakfast, lunch, and dinner in each day', () => {
            const plan = generatePlan({
                dietType: 'mediterranean',
                calorieTarget: 2200,
                userId: mockUserId,
            });

            plan.days.forEach(day => {
                expect(day.meals.length).toBeGreaterThanOrEqual(3);

                const mealTypes = day.meals.map(m => m.mealType);
                expect(mealTypes).toContain('breakfast');
                expect(mealTypes).toContain('lunch');
                expect(mealTypes).toContain('dinner');
            });
        });

        it('should filter meals by diet type', () => {
            const plan = generatePlan({
                dietType: 'vegetarian',
                calorieTarget: 1800,
                userId: mockUserId,
            });

            plan.days.forEach(day => {
                day.meals.forEach(meal => {
                    expect(meal.dietTags).toContain('vegetarian');
                });
            });
        });

        it('should exclude meals with allergens', () => {
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                allergens: ['dairy', 'nuts'],
                userId: mockUserId,
            });

            plan.days.forEach(day => {
                day.meals.forEach(meal => {
                    expect(meal.allergens).not.toContain('dairy');
                    expect(meal.allergens).not.toContain('nuts');
                });
            });
        });

        it('should exclude disliked foods', () => {
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                dislikedFoods: ['salmon', 'tofu'],
                userId: mockUserId,
            });

            plan.days.forEach(day => {
                day.meals.forEach(meal => {
                    expect(meal.name.toLowerCase()).not.toContain('salmon');
                    expect(meal.name.toLowerCase()).not.toContain('tofu');
                });
            });
        });

        it('should calculate total macros for each day', () => {
            const plan = generatePlan({
                dietType: 'keto',
                calorieTarget: 1900,
                userId: mockUserId,
            });

            plan.days.forEach(day => {
                expect(day.totalKcal).toBeGreaterThan(0);
                expect(day.totalProtein).toBeGreaterThan(0);
                expect(day.totalCarbs).toBeGreaterThanOrEqual(0);
                expect(day.totalFat).toBeGreaterThan(0);
            });
        });

        it('should have consistent calorie distribution across days', () => {
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                userId: mockUserId,
            });

            const calories = plan.days.map(d => d.totalKcal);
            const avgCalories = calories.reduce((a, b) => a + b) / calories.length;
            const maxDeviation = Math.max(...calories.map(c => Math.abs(c - avgCalories)));

            // Allow up to 300 cal deviation from target
            expect(maxDeviation).toBeLessThan(300);
        });
    });

    describe('swapMeal', () => {
        it('should replace a meal with another of the same type', () => {
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                userId: mockUserId,
            });

            const day1 = plan.days[0];
            const originalMeal = day1.meals[0];
            const originalMealId = originalMeal.id;

            const updated = swapMeal(plan, 1, originalMealId);

            expect(updated.days[0].meals[0].id).not.toBe(originalMealId);
            expect(updated.days[0].meals[0].mealType).toBe(originalMeal.mealType);
        });

        it('should recalculate day totals after swap', () => {
            const plan = generatePlan({
                dietType: 'mediterranean',
                calorieTarget: 2100,
                userId: mockUserId,
            });

            const day1 = plan.days[0];
            const originalTotalKcal = day1.totalKcal;
            const mealToSwap = day1.meals[0];

            const updated = swapMeal(plan, 1, mealToSwap.id);
            const updatedDay = updated.days[0];

            expect(updatedDay.totalKcal).toBeDefined();
            expect(updatedDay.totalProtein).toBeDefined();
            expect(updatedDay.totalCarbs).toBeDefined();
            expect(updatedDay.totalFat).toBeDefined();
        });

        it('should not swap if meal not found', () => {
            const plan = generatePlan({
                dietType: 'vegetarian',
                calorieTarget: 1800,
                userId: mockUserId,
            });

            const updated = swapMeal(plan, 1, 'nonexistent-meal-id');

            expect(updated).toEqual(plan);
        });
    });

    describe('activatePlan', () => {
        it('should set plan status to active', () => {
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                userId: mockUserId,
            });

            const activated = activatePlan(plan, '2026-10-03');

            expect(activated.status).toBe('active');
            expect(activated.startDate).toBe('2026-10-03');
        });

        it('should assign dates to each day', () => {
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                userId: mockUserId,
            });

            const startDate = '2026-10-03';
            const activated = activatePlan(plan, startDate);

            activated.days.forEach((day, index) => {
                expect(day.date).toBeDefined();
                const expectedDate = new Date(startDate);
                expectedDate.setDate(expectedDate.getDate() + index);
                const expected = expectedDate.toISOString().split('T')[0];
                expect(day.date).toBe(expected);
            });
        });

        it('should preserve meals during activation', () => {
            const plan = generatePlan({
                dietType: 'mediterranean',
                calorieTarget: 2100,
                userId: mockUserId,
            });

            const originalMeals = plan.days[0].meals.length;
            const activated = activatePlan(plan, '2026-10-03');

            expect(activated.days[0].meals.length).toBe(originalMeals);
        });
    });

    describe('getTodayMeals', () => {
        it('should return today meals from active plan', () => {
            const today = new Date().toISOString().split('T')[0];
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                userId: mockUserId,
            });

            const activated = activatePlan(plan, today);
            const todayMeals = getTodayMeals(activated);

            expect(todayMeals).toBeDefined();
            expect(Array.isArray(todayMeals)).toBe(true);
            expect(todayMeals.length).toBeGreaterThan(0);
        });

        it('should return null if plan is not active', () => {
            const plan = generatePlan({
                dietType: 'vegetarian',
                calorieTarget: 1800,
                userId: mockUserId,
            });

            const todayMeals = getTodayMeals(plan);

            expect(todayMeals).toBeNull();
        });

        it('should return null if no active plan', () => {
            const todayMeals = getTodayMeals(null);

            expect(todayMeals).toBeNull();
        });
    });

    describe('calculatePlanStats', () => {
        it('should calculate average macros', () => {
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                userId: mockUserId,
            });

            const stats = calculatePlanStats(plan);

            expect(stats.avgKcal).toBeDefined();
            expect(stats.avgProtein).toBeDefined();
            expect(stats.avgCarbs).toBeDefined();
            expect(stats.avgFat).toBeDefined();
            expect(stats.avgKcal).toBeGreaterThan(0);
        });

        it('should calculate total cost', () => {
            const plan = generatePlan({
                dietType: 'mediterranean',
                calorieTarget: 2100,
                userId: mockUserId,
            });

            const stats = calculatePlanStats(plan);

            expect(stats.totalCost).toBeDefined();
            expect(stats.totalCost).toBeGreaterThan(0);
            expect(stats.weeklyCost).toBe(stats.totalCost);
        });

        it('should average values across 7 days', () => {
            const plan = generatePlan({
                dietType: 'keto',
                calorieTarget: 1900,
                userId: mockUserId,
            });

            const stats = calculatePlanStats(plan);
            const manualAvg = plan.days.reduce((sum, d) => sum + d.totalKcal, 0) / plan.days.length;

            expect(stats.avgKcal).toBe(Math.round(manualAvg));
        });
    });

    describe('Plan entity structure', () => {
        it('should have required fields', () => {
            const plan = generatePlan({
                dietType: 'vegetarian',
                calorieTarget: 1800,
                allergens: ['dairy'],
                dislikedFoods: ['spicy'],
                userId: mockUserId,
            });

            expect(plan.id).toBeDefined();
            expect(plan.userId).toBe(mockUserId);
            expect(plan.dietType).toBe('vegetarian');
            expect(plan.calorieTarget).toBe(1800);
            expect(plan.allergens).toEqual(['dairy']);
            expect(plan.dislikedFoods).toEqual(['spicy']);
            expect(plan.days).toBeDefined();
            expect(plan.createdAt).toBeDefined();
            expect(plan.status).toBe('draft');
        });

        it('should have valid day structure', () => {
            const plan = generatePlan({
                dietType: 'high-protein',
                calorieTarget: 2000,
                userId: mockUserId,
            });

            plan.days.forEach(day => {
                expect(day.dayNumber).toBeDefined();
                expect(day.meals).toBeDefined();
                expect(Array.isArray(day.meals)).toBe(true);
                expect(day.totalKcal).toBeDefined();
                expect(day.totalProtein).toBeDefined();
                expect(day.totalCarbs).toBeDefined();
                expect(day.totalFat).toBeDefined();
            });
        });
    });
});
