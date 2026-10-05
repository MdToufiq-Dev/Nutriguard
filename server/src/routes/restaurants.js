import express from 'express';
import { searchRestaurants, getRestaurantDetails, placeDeliveryOrder, getActiveDeliveryOrders, updateOrderStatus, saveFavoriteRestaurant, removeFavoriteRestaurant, getFavoriteRestaurants } from '../services/deliveryService.js';
import { OrderModel } from '../db/models/order.js';
import { FavoriteModel } from '../db/models/favorite.js';

const router = express.Router();

// Search Nearby Restaurants
router.get('/nearby', async (req, res) => {
  try {
    const filters = req.query;
    const restaurants = await searchRestaurants(filters);
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Restaurant Details
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await getRestaurantDetails(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place Delivery Order
router.post('/orders', async (req, res) => {
  // TODO: Auth middleware
  const userId = 'temp-user-id';
  const { restaurantId, meals, totalPrice } = req.body;
  try {
    const order = await placeDeliveryOrder(userId, restaurantId, meals, totalPrice);
    await OrderModel.create(order);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Active Orders
router.get('/orders/active', async (req, res) => {
  // TODO: Auth middleware
  const userId = 'temp-user-id';
  try {
    const orders = await getActiveDeliveryOrders(userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Order Status
router.patch('/orders/:orderId', async (req, res) => {
  try {
    const order = await updateOrderStatus(req.params.orderId, req.body.status);
    await OrderModel.updateStatus(req.params.orderId, req.body.status);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Favorites
router.get('/favorites', async (req, res) => {
  const userId = 'temp-user-id';
  try {
    const favorites = await getFavoriteRestaurants(userId);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/favorites', async (req, res) => {
  const userId = 'temp-user-id';
  try {
    await saveFavoriteRestaurant(userId, req.body.restaurantId);
    await FavoriteModel.add(userId, req.body.restaurantId);
    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/favorites/:restaurantId', async (req, res) => {
  const userId = 'temp-user-id';
  try {
    await removeFavoriteRestaurant(userId, req.params.restaurantId);
    await FavoriteModel.remove(userId, req.params.restaurantId);
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
