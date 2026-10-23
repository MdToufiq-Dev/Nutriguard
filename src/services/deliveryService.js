/**
 * Delivery service - manages restaurant search and order tracking via backend API
 */

import * as api from './api.js';

export async function searchRestaurants(filters = {}) {
    return await api.get('/restaurants/nearby', filters);
}

export async function getRestaurantDetails(restaurantId) {
    return await api.get(`/restaurants/${restaurantId}`);
}

export async function getDeliveryOrders() {
    return await api.get('/restaurants/orders');
}

export async function placeDeliveryOrder(restaurantId, meals, totalPrice) {
    return await api.post('/restaurants/orders', { restaurantId, meals, totalPrice });
}

export async function getActiveDeliveryOrders() {
    return await api.get('/restaurants/orders/active');
}

export async function updateOrderStatus(orderId, newStatus) {
    return await api.patch(`/restaurants/orders/${orderId}`, { status: newStatus });
}

export async function cancelOrder(orderId) {
    return updateOrderStatus(orderId, 'cancelled');
}

export async function getOrderDetails(orderId) {
    return await api.get(`/restaurants/orders/${orderId}`);
}

export async function saveFavoriteRestaurant(restaurantId) {
    return await api.post('/restaurants/favorites', { restaurantId });
}

export async function getFavoriteRestaurants() {
    return await api.get('/restaurants/favorites');
}

export async function removeFavoriteRestaurant(restaurantId) {
    return await api.del(`/restaurants/favorites/${restaurantId}`);
}
