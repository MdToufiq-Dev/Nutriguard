/**
 * Safety evaluator - evaluates product safety against user constraints
 */
export function evaluateProductSafety(product, userConstraints = {}) {
  const {
    allergens = [],
    dislikedFoods = [],
    diet_type: dietType = 'any',
    restrictedTags = [],
  } = userConstraints;

  const issues = [];
  let severity = 'safe'; // 'safe' | 'warning' | 'blocked'

  // Check allergens (hard block)
  const productAllergens = product.allergens || [];
  const conflictingAllergens = productAllergens.filter(a => allergens.includes(a));
  if (conflictingAllergens.length > 0) {
    issues.push({
      type: 'allergen',
      severity: 'blocked',
      items: conflictingAllergens,
      message: `Contains ${conflictingAllergens.join(', ')}`,
    });
    severity = 'blocked';
  }

  // Check diet tags / rules
  const productTags = product.tags || [];
  if (dietType && dietType !== 'any') {
    if (dietType === 'vegan') {
      if (productAllergens.includes('dairy') || productAllergens.includes('eggs') || productAllergens.includes('fish')) {
        issues.push({
          type: 'diet',
          severity: 'warning',
          message: 'Contains animal products (not vegan)',
        });
        if (severity !== 'blocked') severity = 'warning';
      }
    }
    if (dietType === 'vegetarian') {
      if (productAllergens.includes('fish') || (product.category === 'protein' && !productTags.includes('vegetarian'))) {
        issues.push({
          type: 'diet',
          severity: 'warning',
          message: 'May contain meat/fish (not vegetarian)',
        });
        if (severity !== 'blocked') severity = 'warning';
      }
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

  // Check disliked foods
  const disliked = dislikedFoods.filter(food =>
    (product.name && product.name.toLowerCase().includes(food.toLowerCase())) ||
    (product.brand && product.brand.toLowerCase().includes(food.toLowerCase()))
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
  const conflictingTags = productTags.filter(t => restrictedTags.includes(t));
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
  return 'Review nutrition details before consuming.';
}
