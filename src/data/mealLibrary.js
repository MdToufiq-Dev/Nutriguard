/**
 * Meal library - seed data for diet plan generation
 * Each meal includes nutrition data, cost, allergens, and diet tags
 */

export const mealLibrary = [
    // BREAKFAST
    {
        id: 'meal_001',
        name: 'Greek Yogurt Parfait',
        mealType: 'breakfast',
        dietTags: ['high-protein', 'vegetarian'],
        kcal: 487,
        protein: 24,
        carbs: 45,
        fat: 12,
        cost: 6.50,
        prepMinutes: 10,
        allergens: ['dairy', 'nuts'],
        description: 'Greek yogurt with mixed berries, sliced almonds, and natural honey',
        icon: 'breakfast'
    },
    {
        id: 'meal_002',
        name: 'Protein Smoothie Bowl',
        mealType: 'breakfast',
        dietTags: ['high-protein', 'vegetarian'],
        kcal: 495,
        protein: 26,
        carbs: 48,
        fat: 11,
        cost: 6.80,
        prepMinutes: 8,
        allergens: ['dairy'],
        description: 'Protein powder, banana, spinach, almond milk, topped with granola',
        icon: 'breakfast'
    },
    {
        id: 'meal_003',
        name: 'Avocado Toast with Eggs',
        mealType: 'breakfast',
        dietTags: ['high-protein', 'vegetarian'],
        kcal: 520,
        protein: 22,
        carbs: 38,
        fat: 28,
        cost: 5.20,
        prepMinutes: 12,
        allergens: ['eggs', 'gluten'],
        description: 'Whole grain toast, mashed avocado, poached eggs, cherry tomatoes',
        icon: 'breakfast'
    },
    {
        id: 'meal_004',
        name: 'Mediterranean Omelette',
        mealType: 'breakfast',
        dietTags: ['high-protein', 'mediterranean', 'vegetarian', 'keto'],
        kcal: 465,
        protein: 28,
        carbs: 8,
        fat: 30,
        cost: 6.00,
        prepMinutes: 15,
        allergens: ['eggs', 'dairy'],
        description: '3-egg omelette with feta, spinach, tomatoes, olives',
        icon: 'breakfast'
    },
    {
        id: 'meal_004b',
        name: 'Keto Avocado & Poached Egg Bowl',
        mealType: 'breakfast',
        dietTags: ['high-protein', 'keto', 'vegetarian'],
        kcal: 490,
        protein: 24,
        carbs: 6,
        fat: 38,
        cost: 6.50,
        prepMinutes: 10,
        allergens: ['eggs'],
        description: 'Poached eggs over fresh avocado slices with baby spinach and olive oil drizzle',
        icon: 'breakfast'
    },
    {
        id: 'meal_005',
        name: 'Overnight Oats',
        mealType: 'breakfast',
        dietTags: ['vegetarian'],
        kcal: 425,
        protein: 15,
        carbs: 62,
        fat: 10,
        cost: 4.50,
        prepMinutes: 5,
        allergens: ['gluten', 'nuts'],
        description: 'Rolled oats, chia seeds, almond milk, topped with fresh fruit',
        icon: 'breakfast'
    },
    {
        id: 'meal_006',
        name: 'Scrambled Tofu Bowl',
        mealType: 'breakfast',
        dietTags: ['vegetarian', 'vegan', 'high-protein'],
        kcal: 380,
        protein: 24,
        carbs: 28,
        fat: 18,
        cost: 5.80,
        prepMinutes: 12,
        allergens: ['soy'],
        description: 'Scrambled tofu with turmeric, vegetables, and quinoa',
        icon: 'breakfast'
    },

    // LUNCH
    {
        id: 'meal_007',
        name: 'Quinoa Chicken Bowl',
        mealType: 'lunch',
        dietTags: ['high-protein', 'mediterranean'],
        kcal: 623,
        protein: 52,
        carbs: 55,
        fat: 18,
        cost: 9.20,
        prepMinutes: 20,
        allergens: [],
        description: 'Grilled chicken breast with tri-color quinoa and roasted vegetables',
        icon: 'lunch'
    },
    {
        id: 'meal_008',
        name: 'Salmon Poke Bowl',
        mealType: 'lunch',
        dietTags: ['high-protein', 'mediterranean'],
        kcal: 580,
        protein: 45,
        carbs: 48,
        fat: 22,
        cost: 12.50,
        prepMinutes: 15,
        allergens: ['fish', 'soy'],
        description: 'Fresh salmon, brown rice, edamame, avocado, sesame dressing',
        icon: 'lunch'
    },
    {
        id: 'meal_009',
        name: 'Mediterranean Chickpea Salad',
        mealType: 'lunch',
        dietTags: ['vegetarian', 'vegan', 'mediterranean'],
        kcal: 485,
        protein: 18,
        carbs: 58,
        fat: 20,
        cost: 7.80,
        prepMinutes: 10,
        allergens: [],
        description: 'Chickpeas, cucumber, tomatoes, olives, feta, olive oil dressing',
        icon: 'lunch'
    },
    {
        id: 'meal_010',
        name: 'Turkey & Hummus Wrap',
        mealType: 'lunch',
        dietTags: ['high-protein'],
        kcal: 545,
        protein: 38,
        carbs: 52,
        fat: 16,
        cost: 8.50,
        prepMinutes: 8,
        allergens: ['gluten'],
        description: 'Whole wheat wrap with turkey, hummus, lettuce, tomato, cucumber',
        icon: 'lunch'
    },
    {
        id: 'meal_011',
        name: 'Lentil Buddha Bowl',
        mealType: 'lunch',
        dietTags: ['vegetarian', 'vegan', 'high-protein'],
        kcal: 520,
        protein: 22,
        carbs: 72,
        fat: 12,
        cost: 6.90,
        prepMinutes: 18,
        allergens: [],
        description: 'Lentils, roasted sweet potato, kale, tahini dressing',
        icon: 'lunch'
    },
    {
        id: 'meal_012',
        name: 'Grilled Chicken Caesar Salad',
        mealType: 'lunch',
        dietTags: ['high-protein', 'keto'],
        kcal: 495,
        protein: 48,
        carbs: 18,
        fat: 26,
        cost: 9.80,
        prepMinutes: 12,
        allergens: ['dairy', 'eggs', 'fish'],
        description: 'Romaine lettuce, grilled chicken, parmesan, caesar dressing',
        icon: 'lunch'
    },
    {
        id: 'meal_013',
        name: 'Tofu Stir-Fry',
        mealType: 'lunch',
        dietTags: ['vegetarian', 'vegan', 'high-protein'],
        kcal: 485,
        protein: 26,
        carbs: 52,
        fat: 16,
        cost: 7.50,
        prepMinutes: 15,
        allergens: ['soy'],
        description: 'Crispy tofu, mixed vegetables, brown rice, ginger-soy sauce',
        icon: 'lunch'
    },

    // DINNER
    {
        id: 'meal_014',
        name: 'Pan-Seared Salmon',
        mealType: 'dinner',
        dietTags: ['high-protein', 'mediterranean', 'keto'],
        kcal: 737,
        protein: 46,
        carbs: 38,
        fat: 42,
        cost: 11.80,
        prepMinutes: 25,
        allergens: ['fish'],
        description: 'Wild salmon fillet, roasted sweet potato, garlic asparagus',
        icon: 'dinner'
    },
    {
        id: 'meal_015',
        name: 'Lean Beef Stir-Fry',
        mealType: 'dinner',
        dietTags: ['high-protein'],
        kcal: 685,
        protein: 52,
        carbs: 55,
        fat: 24,
        cost: 10.50,
        prepMinutes: 22,
        allergens: ['soy'],
        description: 'Lean beef strips, broccoli, bell peppers, jasmine rice',
        icon: 'dinner'
    },
    {
        id: 'meal_016',
        name: 'Vegetable Curry with Chickpeas',
        mealType: 'dinner',
        dietTags: ['vegetarian', 'vegan'],
        kcal: 580,
        protein: 18,
        carbs: 82,
        fat: 18,
        cost: 7.20,
        prepMinutes: 30,
        allergens: [],
        description: 'Chickpea curry with coconut milk, mixed vegetables, basmati rice',
        icon: 'dinner'
    },
    {
        id: 'meal_017',
        name: 'Grilled Chicken Breast',
        mealType: 'dinner',
        dietTags: ['high-protein', 'keto'],
        kcal: 620,
        protein: 58,
        carbs: 32,
        fat: 22,
        cost: 9.50,
        prepMinutes: 20,
        allergens: [],
        description: 'Herb-marinated chicken, steamed broccoli, cauliflower rice',
        icon: 'dinner'
    },
    {
        id: 'meal_018',
        name: 'Mediterranean Baked Cod',
        mealType: 'dinner',
        dietTags: ['high-protein', 'mediterranean'],
        kcal: 565,
        protein: 48,
        carbs: 42,
        fat: 18,
        cost: 10.20,
        prepMinutes: 28,
        allergens: ['fish'],
        description: 'Cod with tomatoes, olives, capers, served with couscous',
        icon: 'dinner'
    },
    {
        id: 'meal_019',
        name: 'Turkey Meatballs with Zoodles',
        mealType: 'dinner',
        dietTags: ['high-protein', 'keto'],
        kcal: 485,
        protein: 52,
        carbs: 18,
        fat: 22,
        cost: 8.80,
        prepMinutes: 25,
        allergens: ['eggs'],
        description: 'Lean turkey meatballs, zucchini noodles, marinara sauce',
        icon: 'dinner'
    },
    {
        id: 'meal_020',
        name: 'Eggplant Parmesan',
        mealType: 'dinner',
        dietTags: ['vegetarian'],
        kcal: 595,
        protein: 28,
        carbs: 58,
        fat: 26,
        cost: 8.50,
        prepMinutes: 35,
        allergens: ['dairy', 'eggs', 'gluten'],
        description: 'Breaded eggplant, marinara, mozzarella, side salad',
        icon: 'dinner'
    },
    {
        id: 'meal_021',
        name: 'Shrimp & Avocado Salad',
        mealType: 'dinner',
        dietTags: ['high-protein', 'keto'],
        kcal: 520,
        protein: 42,
        carbs: 22,
        fat: 32,
        cost: 11.20,
        prepMinutes: 15,
        allergens: ['shellfish'],
        description: 'Grilled shrimp, avocado, mixed greens, citrus vinaigrette',
        icon: 'dinner'
    },

    // SNACKS
    {
        id: 'meal_022',
        name: 'Apple with Almond Butter',
        mealType: 'snack',
        dietTags: ['vegetarian', 'vegan'],
        kcal: 210,
        protein: 8,
        carbs: 28,
        fat: 10,
        cost: 2.80,
        prepMinutes: 2,
        allergens: ['nuts'],
        description: 'Organic apple slices with stone-ground almond butter',
        icon: 'snack'
    },
    {
        id: 'meal_023',
        name: 'Protein Energy Balls',
        mealType: 'snack',
        dietTags: ['vegetarian', 'high-protein'],
        kcal: 185,
        protein: 12,
        carbs: 22,
        fat: 6,
        cost: 3.20,
        prepMinutes: 1,
        allergens: ['nuts', 'dairy'],
        description: 'Oats, protein powder, honey, almond butter (3 balls)',
        icon: 'snack'
    },
    {
        id: 'meal_024',
        name: 'Hummus & Veggie Sticks',
        mealType: 'snack',
        dietTags: ['vegetarian', 'vegan'],
        kcal: 165,
        protein: 6,
        carbs: 20,
        fat: 8,
        cost: 3.50,
        prepMinutes: 5,
        allergens: [],
        description: 'Fresh hummus with carrot, celery, and cucumber sticks',
        icon: 'snack'
    },
    {
        id: 'meal_025',
        name: 'Greek Yogurt with Berries',
        mealType: 'snack',
        dietTags: ['vegetarian', 'high-protein'],
        kcal: 195,
        protein: 16,
        carbs: 24,
        fat: 4,
        cost: 3.80,
        prepMinutes: 2,
        allergens: ['dairy'],
        description: 'Plain Greek yogurt with fresh mixed berries',
        icon: 'snack'
    },
    {
        id: 'meal_026',
        name: 'Trail Mix',
        mealType: 'snack',
        dietTags: ['vegetarian', 'vegan'],
        kcal: 220,
        protein: 7,
        carbs: 18,
        fat: 14,
        cost: 2.50,
        prepMinutes: 1,
        allergens: ['nuts'],
        description: 'Almonds, walnuts, dried cranberries, dark chocolate chips',
        icon: 'snack'
    },
    {
        id: 'meal_027',
        name: 'Hard-Boiled Eggs',
        mealType: 'snack',
        dietTags: ['high-protein', 'keto'],
        kcal: 140,
        protein: 12,
        carbs: 2,
        fat: 10,
        cost: 1.80,
        prepMinutes: 1,
        allergens: ['eggs'],
        description: 'Two hard-boiled eggs with sea salt',
        icon: 'snack'
    },
    {
        id: 'meal_028',
        name: 'Cottage Cheese & Pineapple',
        mealType: 'snack',
        dietTags: ['vegetarian', 'high-protein'],
        kcal: 175,
        protein: 18,
        carbs: 22,
        fat: 2,
        cost: 3.20,
        prepMinutes: 2,
        allergens: ['dairy'],
        description: 'Low-fat cottage cheese with fresh pineapple chunks',
        icon: 'snack'
    },
    {
        id: 'meal_029',
        name: 'Edamame',
        mealType: 'snack',
        dietTags: ['vegetarian', 'vegan', 'high-protein'],
        kcal: 155,
        protein: 14,
        carbs: 12,
        fat: 7,
        cost: 3.00,
        prepMinutes: 5,
        allergens: ['soy'],
        description: 'Steamed edamame with sea salt',
        icon: 'snack'
    },
    {
        id: 'meal_030',
        name: 'Protein Shake',
        mealType: 'snack',
        dietTags: ['high-protein'],
        kcal: 240,
        protein: 30,
        carbs: 18,
        fat: 5,
        cost: 4.50,
        prepMinutes: 3,
        allergens: ['dairy'],
        description: 'Whey protein powder, banana, almond milk, ice',
        icon: 'snack'
    },
    {
        id: 'meal_031',
        name: 'Rice Cakes with Avocado',
        mealType: 'snack',
        dietTags: ['vegetarian', 'vegan'],
        kcal: 190,
        protein: 4,
        carbs: 26,
        fat: 9,
        cost: 2.60,
        prepMinutes: 3,
        allergens: [],
        description: 'Brown rice cakes topped with mashed avocado and sea salt',
        icon: 'snack'
    }
];

/**
 * Get meals by type
 */
export function getMealsByType(mealType) {
    return mealLibrary.filter(meal => meal.mealType === mealType);
}

/**
 * Get meals by diet tags
 */
export function getMealsByDiet(dietTags) {
    if (!dietTags || dietTags.length === 0) return mealLibrary;
    return mealLibrary.filter(meal =>
        dietTags.some(tag => meal.dietTags.includes(tag))
    );
}

/**
 * Get meal by ID
 */
export function getMealById(id) {
    return mealLibrary.find(meal => meal.id === id);
}
