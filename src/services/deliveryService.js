/**
 * Delivery service - manages restaurant search and order tracking via backend API
 */

import * as api from './api.js';

/**
 * Search restaurants with constraints
 */
export async function searchRestaurants(filters = {}) {
    return await api.get(`/delivery/restaurants`, filters);
}

/**
 * Get restaurant details
 */
export async function getRestaurantDetails(restaurantId) {
    return await api.get(`/delivery/restaurants/${restaurantId}`);
}

/**
 * Get delivery orders for user
 */
export async function getDeliveryOrders(userId) {
    return await api.get(`/delivery/orders`, { userId });
}

/**
 * Place delivery order
 */
export async function placeDeliveryOrder(userId, restaurantId, meals, totalPrice) {
    return await api.post(`/delivery/orders`, { userId, restaurantId, meals, totalPrice });
}

/**
 * Get active delivery orders (not yet delivered/cancelled)
 */
export async function getActiveDeliveryOrders(userId) {
    return await api.get(`/delivery/orders/active`, { userId });
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, newStatus) {
    return await api.put(`/delivery/orders/${orderId}`, { status: newStatus });
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId) {
    return await api.put(`/delivery/orders/${orderId}`, { status: 'cancelled' });
}

/**
 * Get order details
 */
export async function getOrderDetails(orderId) {
    return await api.get(`/delivery/orders/${orderId}`);
}

/**
 * Save favorite restaurant
 */
export async function saveFavoriteRestaurant(userId, restaurantId) {
    return await api.post(`/delivery/favorites`, { restaurantId });
}

/**
 * Get favorite restaurants
 */
export async function getFavoriteRestaurants(userId) {
    return await api.get(`/delivery/favorites`, { userId });
}

/**
 * Remove favorite restaurant
 */
export async function removeFavoriteRestaurant(userId, restaurantId) {
    return await api.del(`/delivery/favorites/${restaurantId}`);
}
