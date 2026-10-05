/**
 * Restaurant database - seed data for delivery map
 * Each restaurant has location, delivery time, menu items, and diet support
 */

export const restaurantDatabase = [
    {
        id: 'rest_001',
        name: 'GreenLeaf Kitchen',
        cuisine: 'healthy',
        rating: 4.8,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        minOrder: 15,
        distance: 1.2,
        coordinates: { lat: 40.7128, lng: -74.0060 },
        dietSupport: ['vegetarian', 'vegan', 'keto', 'high-protein'],
        allergenInfo: ['nut-free-options', 'gluten-free-options', 'dairy-free-options'],
        popularMeals: [
            { id: 'meal_gl_001', name: 'Buddha Bowl', kcal: 485, price: 12.99, dietary: ['vegan', 'gluten-free'] },
            { id: 'meal_gl_002', name: 'Grilled Salmon', kcal: 520, price: 16.99, dietary: ['keto', 'paleo'] },
            { id: 'meal_gl_003', name: 'Quinoa Salad', kcal: 420, price: 11.99, dietary: ['vegetarian', 'vegan'] },
        ],
        isOpen: true,
        hours: '10:00 AM - 10:00 PM',
    },
    {
        id: 'rest_002',
        name: 'Protein House',
        cuisine: 'fitness',
        rating: 4.6,
        deliveryTime: '20-30 min',
        deliveryFee: 1.99,
        minOrder: 12,
        distance: 0.8,
        coordinates: { lat: 40.7138, lng: -74.0070 },
        dietSupport: ['high-protein', 'keto', 'paleo'],
        allergenInfo: ['nut-free', 'gluten-free-options'],
        popularMeals: [
            { id: 'meal_ph_001', name: 'Chicken & Rice', kcal: 650, price: 13.99, dietary: ['high-protein'] },
            { id: 'meal_ph_002', name: 'Beef Steak Bowl', kcal: 720, price: 15.99, dietary: ['keto', 'high-protein'] },
            { id: 'meal_ph_003', name: 'Turkey Burrito', kcal: 580, price: 12.99, dietary: ['high-protein'] },
        ],
        isOpen: true,
        hours: '7:00 AM - 9:00 PM',
    },
    {
        id: 'rest_003',
        name: 'Mediterranean Grill',
        cuisine: 'mediterranean',
        rating: 4.7,
        deliveryTime: '30-40 min',
        deliveryFee: 3.99,
        minOrder: 18,
        distance: 1.8,
        coordinates: { lat: 40.7118, lng: -74.0050 },
        dietSupport: ['mediterranean', 'vegetarian', 'vegan', 'keto'],
        allergenInfo: ['nut-free-options', 'gluten-free', 'dairy-free-options'],
        popularMeals: [
            { id: 'meal_mg_001', name: 'Falafel Wrap', kcal: 480, price: 11.99, dietary: ['vegetarian', 'vegan'] },
            { id: 'meal_mg_002', name: 'Grilled Lamb', kcal: 550, price: 17.99, dietary: ['mediterranean', 'keto'] },
            { id: 'meal_mg_003', name: 'Greek Salad', kcal: 380, price: 10.99, dietary: ['vegetarian'] },
        ],
        isOpen: true,
        hours: '11:00 AM - 11:00 PM',
    },
    {
        id: 'rest_004',
        name: 'Sushi Express',
        cuisine: 'asian',
        rating: 4.5,
        deliveryTime: '25-35 min',
        deliveryFee: 2.49,
        minOrder: 14,
        distance: 1.5,
        coordinates: { lat: 40.7148, lng: -74.0080 },
        dietSupport: ['keto', 'high-protein', 'paleo'],
        allergenInfo: ['contains-fish', 'gluten-free-options', 'contains-soy'],
        popularMeals: [
            { id: 'meal_se_001', name: 'Salmon Sushi Box', kcal: 420, price: 14.99, dietary: ['high-protein', 'keto'] },
            { id: 'meal_se_002', name: 'Edamame & Rice', kcal: 380, price: 9.99, dietary: [] },
            { id: 'meal_se_003', name: 'Tuna Roll', kcal: 400, price: 13.99, dietary: ['high-protein'] },
        ],
        isOpen: true,
        hours: '12:00 PM - 10:00 PM',
    },
    {
        id: 'rest_005',
        name: 'Burger Barn',
        cuisine: 'american',
        rating: 4.4,
        deliveryTime: '15-25 min',
        deliveryFee: 1.49,
        minOrder: 10,
        distance: 0.6,
        coordinates: { lat: 40.7158, lng: -74.0090 },
        dietSupport: ['keto', 'high-protein'],
        allergenInfo: ['contains-gluten', 'contains-dairy', 'nut-free'],
        popularMeals: [
            { id: 'meal_bb_001', name: 'Grass-Fed Burger', kcal: 680, price: 12.99, dietary: ['keto', 'high-protein'] },
            { id: 'meal_bb_002', name: 'Chicken Sandwich', kcal: 520, price: 11.99, dietary: ['high-protein'] },
            { id: 'meal_bb_003', name: 'Beef Bowl', kcal: 720, price: 13.99, dietary: ['keto'] },
        ],
        isOpen: true,
        hours: '10:00 AM - 11:00 PM',
    },
    {
        id: 'rest_006',
        name: 'Vegan Vibes',
        cuisine: 'vegan',
        rating: 4.9,
        deliveryTime: '20-30 min',
        deliveryFee: 2.99,
        minOrder: 13,
        distance: 1.1,
        coordinates: { lat: 40.7168, lng: -74.0100 },
        dietSupport: ['vegan', 'vegetarian', 'raw'],
        allergenInfo: ['nut-free-options', 'gluten-free', 'soy-free-options'],
        popularMeals: [
            { id: 'meal_vv_001', name: 'Acai Bowl', kcal: 380, price: 10.99, dietary: ['vegan'] },
            { id: 'meal_vv_002', name: 'Chickpea Curry', kcal: 450, price: 12.99, dietary: ['vegan'] },
            { id: 'meal_vv_003', name: 'Raw Salad', kcal: 320, price: 11.99, dietary: ['vegan', 'raw'] },
        ],
        isOpen: true,
        hours: '9:00 AM - 9:00 PM',
    },
    {
        id: 'rest_007',
        name: 'Poke Spot',
        cuisine: 'asian',
        rating: 4.7,
        deliveryTime: '15-25 min',
        deliveryFee: 1.99,
        minOrder: 11,
        distance: 0.9,
        coordinates: { lat: 40.7178, lng: -74.0110 },
        dietSupport: ['high-protein', 'keto', 'paleo'],
        allergenInfo: ['contains-fish', 'contains-soy', 'gluten-free-options'],
        popularMeals: [
            { id: 'meal_ps_001', name: 'Ahi Poke Bowl', kcal: 480, price: 13.99, dietary: ['high-protein', 'keto'] },
            { id: 'meal_ps_002', name: 'Salmon Poke', kcal: 520, price: 14.99, dietary: ['high-protein', 'omega-3'] },
            { id: 'meal_ps_003', name: 'Veggie Poke', kcal: 350, price: 11.99, dietary: ['vegan'] },
        ],
        isOpen: true,
        hours: '11:00 AM - 10:00 PM',
    },
];

/**
 * Get all restaurants
 */
export function getAllRestaurants() {
    return restaurantDatabase;
}

/**
 * Get restaurant by ID
 */
export function getRestaurantById(id) {
    return restaurantDatabase.find(r => r.id === id) || null;
}

/**
 * Filter restaurants by diet support
 */
export function getRestaurantsByDiet(dietType) {
    if (!dietType || dietType === 'any') return restaurantDatabase;
    return restaurantDatabase.filter(r => r.dietSupport.includes(dietType));
}

/**
 * Filter restaurants by allergen compatibility
 */
export function getRestaurantsByAllergen(allergens) {
    if (!allergens || allergens.length === 0) return restaurantDatabase;

    return restaurantDatabase.filter(r => {
        // Check if restaurant has options that avoid user allergens
        const allergenMap = {
            'dairy': 'dairy-free-options',
            'nuts': 'nut-free-options',
            'gluten': 'gluten-free-options',
            'soy': 'soy-free-options',
            'fish': 'fish-free-options',
            'shellfish': 'shellfish-free-options',
        };

        return allergens.every(allergen => {
            const requiredOption = allergenMap[allergen];
            return r.allergenInfo.includes(requiredOption) || r.allergenInfo.includes(allergen + '-free');
        });
    });
}

/**
 * Search restaurants by name or cuisine
 */
export function searchRestaurants(query) {
    const lower = query.toLowerCase();
    return restaurantDatabase.filter(r =>
        r.name.toLowerCase().includes(lower) ||
        r.cuisine.toLowerCase().includes(lower)
    );
}

/**
 * Get nearby restaurants within distance (km)
 */
export function getNearbyRestaurants(maxDistance = 3) {
    return restaurantDatabase
        .filter(r => r.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);
}

/**
 * Get restaurants sorted by rating
 */
export function getRestaurantsByRating() {
    return [...restaurantDatabase].sort((a, b) => b.rating - a.rating);
}

/**
 * Get restaurants sorted by delivery time
 */
export function getRestaurantsByDeliveryTime() {
    return [...restaurantDatabase].sort((a, b) => {
        const timeA = parseInt(a.deliveryTime.split('-')[0]);
        const timeB = parseInt(b.deliveryTime.split('-')[0]);
        return timeA - timeB;
    });
}
