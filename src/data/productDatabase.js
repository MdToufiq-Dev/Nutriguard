/**
 * Product database - mock barcode lookup data
 * In phase 2, this connects to backend API or barcode database
 */

export const productDatabase = [
    // Proteins & Meats
    {
        barcode: '012345678901',
        name: 'Grilled Chicken Breast',
        brand: 'Tyson',
        category: 'protein',
        kcal: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        allergens: [],
        tags: ['high-protein', 'low-carb'],
    },
    {
        barcode: '012345678902',
        name: 'Ground Beef 93/7',
        brand: 'Lean Beef Co',
        category: 'protein',
        kcal: 160,
        protein: 22,
        carbs: 0,
        fat: 8,
        allergens: [],
        tags: ['high-protein'],
    },
    {
        barcode: '012345678903',
        name: 'Wild Salmon Fillet',
        brand: 'SeaQuest',
        category: 'protein',
        kcal: 208,
        protein: 20,
        carbs: 0,
        fat: 13,
        allergens: ['fish'],
        tags: ['high-protein', 'omega-3'],
    },
    {
        barcode: '012345678904',
        name: 'Greek Yogurt Plain',
        brand: 'Fage',
        category: 'dairy',
        kcal: 59,
        protein: 10,
        carbs: 3.3,
        fat: 0.4,
        allergens: ['dairy'],
        tags: ['high-protein', 'probiotic'],
    },

    // Grains & Carbs
    {
        barcode: '012345678905',
        name: 'Quinoa (dry)',
        brand: 'Nature\'s Way',
        category: 'grain',
        kcal: 368,
        protein: 14,
        carbs: 64,
        fat: 6,
        allergens: [],
        tags: ['complete-protein', 'vegan'],
    },
    {
        barcode: '012345678906',
        name: 'Brown Rice (dry)',
        brand: 'Lundberg',
        category: 'grain',
        kcal: 111,
        protein: 2.6,
        carbs: 23,
        fat: 0.9,
        allergens: [],
        tags: ['whole-grain'],
    },
    {
        barcode: '012345678907',
        name: 'Whole Wheat Bread',
        brand: 'Dave\'s',
        category: 'grain',
        kcal: 80,
        protein: 4,
        carbs: 14,
        fat: 1,
        allergens: ['gluten'],
        tags: ['whole-grain'],
    },
    {
        barcode: '012345678908',
        name: 'Oats (rolled)',
        brand: 'Bob\'s Red Mill',
        category: 'grain',
        kcal: 150,
        protein: 5,
        carbs: 27,
        fat: 3,
        allergens: [],
        tags: ['whole-grain', 'gluten-free'],
    },

    // Vegetables & Fruits
    {
        barcode: '012345678909',
        name: 'Broccoli (frozen)',
        brand: 'Birds Eye',
        category: 'vegetable',
        kcal: 34,
        protein: 3.7,
        carbs: 7,
        fat: 0.4,
        allergens: [],
        tags: ['low-calorie', 'vegan'],
    },
    {
        barcode: '012345678910',
        name: 'Spinach (fresh)',
        brand: 'Organic Valley',
        category: 'vegetable',
        kcal: 23,
        protein: 2.9,
        carbs: 3.6,
        fat: 0.4,
        allergens: [],
        tags: ['low-calorie', 'vegan'],
    },
    {
        barcode: '012345678911',
        name: 'Blueberries (frozen)',
        brand: 'Cascadian Farm',
        category: 'fruit',
        kcal: 57,
        protein: 0.7,
        carbs: 14,
        fat: 0.3,
        allergens: [],
        tags: ['antioxidants', 'vegan'],
    },
    {
        barcode: '012345678912',
        name: 'Bananas (organic)',
        brand: 'Dole',
        category: 'fruit',
        kcal: 89,
        protein: 1.1,
        carbs: 23,
        fat: 0.3,
        allergens: [],
        tags: ['potassium', 'vegan'],
    },

    // Nuts & Seeds
    {
        barcode: '012345678913',
        name: 'Almonds (raw)',
        brand: 'Mauna Loa',
        category: 'nut',
        kcal: 579,
        protein: 21,
        carbs: 22,
        fat: 50,
        allergens: ['nuts'],
        tags: ['high-protein', 'vegan'],
    },
    {
        barcode: '012345678914',
        name: 'Chia Seeds',
        brand: 'Navitas',
        category: 'seed',
        kcal: 486,
        protein: 17,
        carbs: 42,
        fat: 31,
        allergens: [],
        tags: ['omega-3', 'vegan'],
    },
    {
        barcode: '012345678915',
        name: 'Almond Butter',
        brand: 'Justin\'s',
        category: 'nut-butter',
        kcal: 588,
        protein: 21,
        carbs: 19,
        fat: 50,
        allergens: ['nuts'],
        tags: ['high-protein', 'vegan'],
    },

    // Condiments & Oils
    {
        barcode: '012345678916',
        name: 'Olive Oil Extra Virgin',
        brand: 'California Olive Ranch',
        category: 'oil',
        kcal: 884,
        protein: 0,
        carbs: 0,
        fat: 100,
        allergens: [],
        tags: ['mediterranean'],
    },
    {
        barcode: '012345678917',
        name: 'Honey (raw)',
        brand: 'Y.S. Eco Bee Farms',
        category: 'sweetener',
        kcal: 304,
        protein: 0.3,
        carbs: 82,
        fat: 0,
        allergens: [],
        tags: ['vegan', 'natural'],
    },

    // Dairy
    {
        barcode: '012345678918',
        name: 'Feta Cheese',
        brand: 'Athenos',
        category: 'dairy',
        kcal: 264,
        protein: 14,
        carbs: 4.1,
        fat: 21,
        allergens: ['dairy'],
        tags: ['mediterranean'],
    },
    {
        barcode: '012345678919',
        name: 'Eggs (large)',
        brand: 'Vital Farms',
        category: 'protein',
        kcal: 155,
        protein: 13,
        carbs: 1.1,
        fat: 11,
        allergens: ['eggs'],
        tags: ['high-protein'],
    },

    // Prepared/Packaged
    {
        barcode: '012345678920',
        name: 'Protein Powder (whey)',
        brand: 'Optimum Nutrition',
        category: 'supplement',
        kcal: 120,
        protein: 24,
        carbs: 2,
        fat: 1,
        allergens: ['dairy'],
        tags: ['high-protein', 'supplement'],
    },
    {
        barcode: '012345678921',
        name: 'Tofu (firm)',
        brand: 'Nasoya',
        category: 'protein',
        kcal: 76,
        protein: 8.1,
        carbs: 1.9,
        fat: 4.8,
        allergens: ['soy'],
        tags: ['vegetarian', 'vegan'],
    },
];

/**
 * Get product by barcode
 */
export function getProductByBarcode(barcode) {
    return productDatabase.find(p => p.barcode === barcode) || null;
}

/**
 * Search products by name or brand
 */
export function searchProducts(query) {
    const lower = query.toLowerCase();
    return productDatabase.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
    );
}

/**
 * Get products by category
 */
export function getProductsByCategory(category) {
    return productDatabase.filter(p => p.category === category);
}
