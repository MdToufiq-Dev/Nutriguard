import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const FavoriteModel = {
  async getByUserId(userId) {
    const res = await pool.query(
      'SELECT restaurant_id FROM favorite_restaurants WHERE user_id = $1',
      [userId]
    );
    return res.rows.map(r => r.restaurant_id);
  },

  async add(userId, restaurantId) {
    await pool.query(
      'INSERT INTO favorite_restaurants (user_id, restaurant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, restaurantId]
    );
  },

  async remove(userId, restaurantId) {
    await pool.query(
      'DELETE FROM favorite_restaurants WHERE user_id = $1 AND restaurant_id = $2',
      [userId, restaurantId]
    );
  }
};
