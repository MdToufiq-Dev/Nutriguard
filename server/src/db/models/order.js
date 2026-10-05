import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const OrderModel = {
  async create(order) {
    const { id, userId, restaurantId, restaurantName, restaurantCuisine, meals, mealCount, totalPrice, deliveryFee, totalWithFee, status, eta, distance, createdAt, updatedAt } = order;

    // Convert meals to JSON string for storage
    const mealsJson = JSON.stringify(meals);

    const query = `
      INSERT INTO delivery_orders (
        id, user_id, restaurant_id, restaurant_name, restaurant_cuisine, meals,
        meal_count, total_price, delivery_fee, total_with_fee, status, eta,
        distance, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;
    const values = [
      id, userId, restaurantId, restaurantName, restaurantCuisine, mealsJson,
      mealCount, totalPrice, deliveryFee, totalWithFee, status, eta,
      distance, createdAt, updatedAt
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
  },

  async getByUserId(userId) {
    const res = await pool.query(
      'SELECT * FROM delivery_orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows;
  },

  async getById(orderId) {
    const res = await pool.query('SELECT * FROM delivery_orders WHERE id = $1', [orderId]);
    return res.rows[0];
  },

  async updateStatus(orderId, status) {
    const res = await pool.query(
      'UPDATE delivery_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    return res.rows[0];
  }
};
