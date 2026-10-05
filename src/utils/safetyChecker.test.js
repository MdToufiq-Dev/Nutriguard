import { describe, it, expect } from 'vitest';
import {
    checkProductSafety,
    calculateMacroRatio,
    getMacroSummary,
    estimateDailyImpact,
} from '../utils/safetyChecker';

describe('safetyChecker', () => {
    const mockProduct = {
        id: 'prod_001',
        name: 'Grilled Chicken Breast',
        brand: 'Tyson',
        kcal: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        allergens: [],
        tags: ['high-protein', 'low-carb'],
    };

    const mockProductWithAllergen = {
        id: 'prod_002',
        name: 'Greek Yogurt',
        brand: 'Fage',
        kcal: 59,
        protein: 10,
        carbs: 3.3,
        fat: 0.4,
        allergens: ['dairy'],
        tags: ['probiotic'],
    };

    describe('checkProductSafety', () => {
        it('should return safe for product with no conflicts', () => {
            const safety = checkProductSafety(mockProduct, {});

            expect(safety.safe).toBe(true);
            expect(safety.blocked).toBe(false);
            expect(safety.warning).toBe(false);
            expect(safety.severity).toBe('safe');
        });

        it('should block product if it contains user allergen', () => {
            const safety = checkProductSafety(mockProductWithAllergen, {
                allergens: ['dairy'],
            });

            expect(safety.safe).toBe(false);
            expect(safety.blocked).toBe(true);
            expect(safety.severity).toBe('blocked');
            expect(safety.issues.some(i => i.type === 'allergen')).toBe(true);
        });

        it('should warn for high-carb product on keto diet', () => {
            const highCarbProduct = {
                ...mockProduct,
                carbs: 45,
            };

            const safety = checkProductSafety(highCarbProduct, {
                dietType: 'keto',
            });

            expect(safety.warning).toBe(true);
            expect(safety.issues.some(i => i.type === 'macros')).toBe(true);
        });

        it('should warn for disliked food', () => {
            const safety = checkProductSafety(mockProduct, {
                dislikedFoods: ['chicken'],
            });

            expect(safety.warning).toBe(true);
            expect(safety.issues.some(i => i.type === 'dislike')).toBe(true);
        });

        it('should warn for restricted tags', () => {
            const safety = checkProductSafety(mockProduct, {
                restrictedTags: ['high-protein'],
            });

            expect(safety.warning).toBe(true);
            expect(safety.issues.some(i => i.type === 'restriction')).toBe(true);
        });

        it('should provide recommendation text', () => {
            const safety = checkProductSafety(mockProduct, {});

            expect(safety.recommendation).toBeDefined();
            expect(typeof safety.recommendation).toBe('string');
            expect(safety.recommendation.length > 0).toBe(true);
        });

        it('should handle multiple allergens', () => {
            const multiAllergenProduct = {
                ...mockProductWithAllergen,
                allergens: ['dairy', 'nuts'],
            };

            const safety = checkProductSafety(multiAllergenProduct, {
                allergens: ['dairy', 'gluten'],
            });

            expect(safety.blocked).toBe(true);
            const allergenIssue = safety.issues.find(i => i.type === 'allergen');
            expect(allergenIssue.items).toContain('dairy');
        });
    });

    describe('calculateMacroRatio', () => {
        it('should calculate correct macro percentages', () => {
            const ratio = calculateMacroRatio(mockProduct);

            expect(ratio.proteinPercent).toBeGreaterThan(0);
            expect(ratio.carbPercent).toBeGreaterThanOrEqual(0);
            expect(ratio.fatPercent).toBeGreaterThan(0);
            expect(ratio.proteinPercent + ratio.carbPercent + ratio.fatPercent).toBe(100);
        });

        it('should identify high-protein product', () => {
            const ratio = calculateMacroRatio(mockProduct);

            // Chicken is ~75% protein
            expect(ratio.proteinPercent).toBeGreaterThan(60);
        });

        it('should identify high-carb product', () => {
            const highCarbProduct = {
                ...mockProduct,
                kcal: 400,
                protein: 5,
                carbs: 80,
                fat: 2,
            };

            const ratio = calculateMacroRatio(highCarbProduct);

            expect(ratio.carbPercent).toBeGreaterThan(70);
        });
    });

    describe('getMacroSummary', () => {
        it('should tag high-protein products', () => {
            const summary = getMacroSummary(mockProduct);

            expect(summary.tags).toContain('high-protein');
        });

        it('should tag low-calorie products', () => {
            const lowCalProduct = {
                ...mockProduct,
                kcal: 50,
            };

            const summary = getMacroSummary(lowCalProduct);

            expect(summary.tags).toContain('low-calorie');
        });

        it('should tag low-carb products', () => {
            const summary = getMacroSummary(mockProduct);

            expect(summary.tags).toContain('low-carb');
        });

        it('should include macro ratio', () => {
            const summary = getMacroSummary(mockProduct);

            expect(summary.ratio).toBeDefined();
            expect(summary.ratio.proteinPercent).toBeDefined();
            expect(summary.ratio.carbPercent).toBeDefined();
            expect(summary.ratio.fatPercent).toBeDefined();
        });
    });

    describe('estimateDailyImpact', () => {
        it('should calculate totals with no prior scans', () => {
            const impact = estimateDailyImpact(mockProduct, []);

            expect(impact.totalKcal).toBe(mockProduct.kcal);
            expect(impact.totalProtein).toBe(mockProduct.protein);
            expect(impact.totalCarbs).toBe(mockProduct.carbs);
            expect(impact.totalFat).toBe(mockProduct.fat);
            expect(impact.scanCount).toBe(1);
        });

        it('should accumulate totals from existing scans', () => {
            const existingScans = [
                { kcal: 500, protein: 25, carbs: 50, fat: 20 },
                { kcal: 300, protein: 15, carbs: 30, fat: 10 },
            ];

            const impact = estimateDailyImpact(mockProduct, existingScans);

            expect(impact.totalKcal).toBe(965); // 500 + 300 + 165
            expect(impact.totalProtein).toBe(71); // 25 + 15 + 31
            expect(impact.totalCarbs).toBe(80); // 50 + 30 + 0
            expect(impact.totalFat).toBe(33.6); // 20 + 10 + 3.6
            expect(impact.scanCount).toBe(3);
        });

        it('should work with many prior scans', () => {
            const existingScans = Array(10).fill({
                kcal: 200,
                protein: 10,
                carbs: 20,
                fat: 8,
            });

            const impact = estimateDailyImpact(mockProduct, existingScans);

            expect(impact.totalKcal).toBe(2165); // (200 * 10) + 165
            expect(impact.scanCount).toBe(11);
        });
    });

    describe('Safety check edge cases', () => {
        it('should not warn for vegan product when vegan diet selected', () => {
            const veganProduct = {
                ...mockProduct,
                allergens: [],
                tags: ['vegan'],
            };

            const safety = checkProductSafety(veganProduct, {
                dietType: 'vegan',
            });

            expect(safety.warning).toBe(false);
        });

        it('should handle empty constraints', () => {
            const safety = checkProductSafety(mockProduct, {});

            expect(safety.severity).toBe('safe');
            expect(safety.safe).toBe(true);
        });

        it('should prioritize allergen block over other warnings', () => {
            const safety = checkProductSafety(mockProductWithAllergen, {
                allergens: ['dairy'],
                dislikedFoods: ['yogurt'],
            });

            expect(safety.blocked).toBe(true);
            expect(safety.severity).toBe('blocked');
        });
    });
});
