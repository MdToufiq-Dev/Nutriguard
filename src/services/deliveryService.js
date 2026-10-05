/**
 * Delivery service - manages restaurant search and order tracking
 */

import * as storage from './storage.js';
import {
    getRestaurantsByDiet,
    getRestaurantsByAllergen,
    getNearbyRestaurants,
    getRestaurantsByRating,
} from '../data/restaurantDatabase.js';

/**
 * Search restaurants with constraints
 * Entity: restaurant { id, name, cuisine, rating, distance, deliveryTime, dietSupport[], allergenInfo[] }
 */
export async function searchRestaurants(filters = {}) {
    // later: request(`/delivery/restaurants?${new URLSearchParams(filters)}`)
    const {
        dietType = 'any',
        allergens = [],
        maxDistance = 3,
        sortBy = 'distance', // 'distance' | 'rating' | 'delivery-time'
    } = filters;

    let results = getNearbyRestaurants(maxDistance);

    // Apply diet filter
    if (dietType !== 'any') {
        results = results.filter(r => r.dietSupport.includes(dietType));
    }

    // Apply allergen filter
    if (allergens.length > 0) {
        results = getRestaurantsByAllergen(allergens);
        results = results.filter(r => r.distance <= maxDistance);
    }

    // Sort
    if (sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'delivery-time') {
        results.sort((a, b) => {
            const timeA = parseInt(a.deliveryTime.split('-')[0]);
            const timeB = parseInt(b.deliveryTime.split('-')[0]);
            return timeA - timeB;
        });
    }
    // else default 'distance' already sorted

    return results;
}

/**
 * Get restaurant details
 */
export async function getRestaurantDetails(restaurantId) {
    // later: request(`/delivery/restaurants/${restaurantId}`)
    const { getRestaurantById } = await import('../data/restaurantDatabase.js');
    return getRestaurantById(restaurantId);
}

/**
 * Get delivery orders for user
 * Entity: delivery_order { id, userId, restaurantId, restaurantName, meals[], totalPrice, status, eta, createdAt }
 */
export async function getDeliveryOrders(userId) {
    // later: request(`/delivery/orders?userId=${userId}`)
    const orders = await storage.list('order_');
    return orders.filter(o => o.userId === userId).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );
}

/**
 * Place delivery order
 */
export async function placeDeliveryOrder(userId, restaurantId, meals, totalPrice) {
    // later: request(`/delivery/orders`, { method: 'POST', body: { restaurantId, meals, totalPrice } })
    const { getRestaurantById } = await import('../data/restaurantDatabase.js');
    const restaurant = getRestaurantById(restaurantId);

    if (!restaurant) {
        throw new Error(`Restaurant not found: ${restaurantId}`);
    }

    // Estimate ETA (add delivery time to now)
    const deliveryMinutes = parseInt(restaurant.deliveryTime.split('-')[1]);
    const eta = new Date(Date.now() + deliveryMinutes * 60 * 1000).toISOString();

    const order = {
        id: `order_${userId}_${Date.now()}`,
        userId,
        restaurantId,
        restaurantName: restaurant.name,
        restaurantCuisine: restaurant.cuisine,
        meals,
        mealCount: meals.length,
        totalPrice,
        deliveryFee: restaurant.deliveryFee,
        totalWithFee: totalPrice + restaurant.deliveryFee,
        status: 'confirmed', // 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'
        eta,
        distance: restaurant.distance,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await storage.set(order.id, order);
    return order;
}

/**
 * Get active delivery orders (not yet delivered/cancelled)
 */
export async function getActiveDeliveryOrders(userId) {
    const orders = await getDeliveryOrders(userId);
    return orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, newStatus) {
    // later: request(`/delivery/orders/${orderId}`, { method: 'PATCH', body: { status: newStatus } })
    const order = await storage.get(orderId);
    if (!order) throw new Error(`Order not found: ${orderId}`);

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    await storage.set(orderId, order);
    return order;
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId) {
    return await updateOrderStatus(orderId, 'cancelled');
}

/**
 * Get order details
 */
export async function getOrderDetails(orderId) {
    return await storage.get(orderId);
}

/**
 * Save favorite restaurant
 */
export async function saveFavoriteRestaurant(userId, restaurantId) {
    // later: request(`/delivery/favorites`, { method: 'POST', body: { restaurantId } })
    const favorites = await storage.get(`favorites_${userId}`) || { ids: [] };
    if (!favorites.ids.includes(restaurantId)) {
        favorites.ids.push(restaurantId);
    }
    await storage.set(`favorites_${userId}`, favorites);
    return favorites;
}

/**
 * Get favorite restaurants
 */
export async function getFavoriteRestaurants(userId) {
    // later: request(`/delivery/favorites?userId=${userId}`)
    const favorites = await storage.get(`favorites_${userId}`) || { ids: [] };
    const { getRestaurantById } = await import('../data/restaurantDatabase.js');
    return favorites.ids.map(id => getRestaurantById(id)).filter(Boolean);
}

/**
 * Remove favorite restaurant
 */
export async function removeFavoriteRestaurant(userId, restaurantId) {
    const favorites = await storage.get(`favorites_${userId}`) || { ids: [] };
    favorites.ids = favorites.ids.filter(id => id !== restaurantId);
    await storage.set(`favorites_${userId}`, favorites);
    return favorites;
}
