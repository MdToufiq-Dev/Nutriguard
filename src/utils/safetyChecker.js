/**
 * Safety checker - validates products against user constraints
 * Used during barcode scanning to warn about allergens/restrictions
 */

/**
 * Check product safety against user constraints
 * @param {Object} product - Product from database
 * @param {Object} userConstraints - User allergens, dislikes, dietType
 * @returns {Object} Safety status with warnings
 */
export function checkProductSafety(product, userConstraints = {}) {
    const {
        allergens = [],
        dislikedFoods = [],
        dietType = 'any',
        restrictedTags = [],
    } = userConstraints;

    const issues = [];
    let severity = 'safe'; // 'safe' | 'warning' | 'blocked'

    // Check allergens (hard block)
    const conflictingAllergens = product.allergens.filter(a => allergens.includes(a));
    if (conflictingAllergens.length > 0) {
        issues.push({
            type: 'allergen',
            severity: 'blocked',
            items: conflictingAllergens,
            message: `Contains ${conflictingAllergens.join(', ')}`,
        });
        severity = 'blocked';
    }

    // Check diet tags (warning)
    if (dietType !== 'any' && !product.tags.includes(dietType)) {
        // For specific diets, check if product conflicts
        if (dietType === 'vegan' && product.allergens.includes('dairy')) {
            issues.push({
                type: 'diet',
                severity: 'warning',
                message: 'Contains dairy (not vegan)',
            });
            if (severity !== 'blocked') severity = 'warning';
        }
        if (dietType === 'keto' && product.carbs > 5) {
            issues.push({
                type: 'macros',
                severity: 'warning',
                message: `High carbs (${product.carbs}g) for keto`,
            });
            if (severity !== 'blocked') severity = 'warning';
        }
    }

    // Check disliked foods (soft warning)
    const disliked = dislikedFoods.filter(food =>
        product.name.toLowerCase().includes(food.toLowerCase()) ||
        product.brand.toLowerCase().includes(food.toLowerCase())
    );
    if (disliked.length > 0) {
        issues.push({
            type: 'dislike',
            severity: 'warning',
            message: `Matches disliked food: ${disliked[0]}`,
        });
        if (severity !== 'blocked') severity = 'warning';
    }

    // Check restricted tags
    const conflictingTags = product.tags.filter(t => restrictedTags.includes(t));
    if (conflictingTags.length > 0) {
        issues.push({
            type: 'restriction',
            severity: 'warning',
            items: conflictingTags,
            message: `Contains restricted tags: ${conflictingTags.join(', ')}`,
        });
        if (severity !== 'blocked') severity = 'warning';
    }

    return {
        safe: severity === 'safe',
        blocked: severity === 'blocked',
        warning: severity === 'warning',
        severity,
        issues,
        recommendation: getSafetyRecommendation(severity, issues),
    };
}

/**
 * Get human-readable recommendation
 */
function getSafetyRecommendation(severity, issues) {
    if (severity === 'safe') {
        return 'This product matches your dietary preferences.';
    }
    if (severity === 'blocked') {
        return 'This product contains allergens on your list. Not recommended.';
    }
    if (severity === 'warning') {
        const firstIssue = issues[0];
        if (firstIssue.type === 'macros') {
            return 'This product is higher in carbs. Consume in moderation.';
        }
        if (firstIssue.type === 'diet') {
            return 'This product may not align with your diet type.';
        }
        if (firstIssue.type === 'dislike') {
            return 'This product contains a food you marked as disliked.';
        }
        return 'Please review this product before consuming.';
    }
}

/**
 * Calculate macro balance for a product
 * Returns protein, carb, fat ratios
 */
export function calculateMacroRatio(product) {
    const totalCals = (product.protein * 4) + (product.carbs * 4) + (product.fat * 9);

    return {
        proteinPercent: Math.round((product.protein * 4 / totalCals) * 100),
        carbPercent: Math.round((product.carbs * 4 / totalCals) * 100),
        fatPercent: Math.round((product.fat * 9 / totalCals) * 100),
    };
}

/**
 * Get macro summary for a product
 */
export function getMacroSummary(product) {
    const ratio = calculateMacroRatio(product);
    const tags = [];

    if (ratio.proteinPercent >= 30) tags.push('high-protein');
    if (ratio.carbPercent <= 10) tags.push('low-carb');
    if (product.kcal <= 100) tags.push('low-calorie');
    if (product.fat >= 10) tags.push('high-fat');

    return {
        tags,
        ratio,
    };
}

/**
 * Estimate daily impact of adding scanned products
 */
export function estimateDailyImpact(product, existingScans = []) {
    const totalKcal = existingScans.reduce((sum, s) => sum + s.kcal, 0) + product.kcal;
    const totalProtein = existingScans.reduce((sum, s) => sum + s.protein, 0) + product.protein;
    const totalCarbs = existingScans.reduce((sum, s) => sum + s.carbs, 0) + product.carbs;
    const totalFat = existingScans.reduce((sum, s) => sum + s.fat, 0) + product.fat;

    return {
        totalKcal,
        totalProtein,
        totalCarbs,
        totalFat,
        scanCount: existingScans.length + 1,
    };
}
