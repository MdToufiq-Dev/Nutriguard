import pool from '../pool.js';

export const RestaurantModel = {
  async getAll() {
    const res = await pool.query(`
      SELECT r.id, r.name, r.lat, r.lng, r.address, r.price_range as "priceRange",
             COALESCE(ARRAY_AGG(rt.tag) FILTER (WHERE rt.tag IS NOT NULL), '{}') as tags
      FROM restaurants r
      LEFT JOIN restaurant_tags rt ON r.id = rt.restaurant_id
      GROUP BY r.id, r.name, r.lat, r.lng, r.address, r.price_range
    `);
    return res.rows;
  },

  async getById(id) {
    const res = await pool.query(
      `SELECT r.id, r.name, r.lat, r.lng, r.address, r.price_range as "priceRange",
              COALESCE(ARRAY_AGG(rt.tag) FILTER (WHERE rt.tag IS NOT NULL), '{}') as tags
       FROM restaurants r
       LEFT JOIN restaurant_tags rt ON r.id = rt.restaurant_id
       WHERE r.id = $1
       GROUP BY r.id, r.name, r.lat, r.lng, r.address, r.price_range`,
      [id]
    );
    return res.rows[0] || null;
  },

  async upsert(restaurant) {
    const { id, name, lat, lng, address = '', priceRange = 2, tags = [] } = restaurant;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO restaurants (id, name, lat, lng, address, price_range)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          address = EXCLUDED.address,
          price_range = EXCLUDED.price_range
        RETURNING *;
      `;
      await client.query(query, [id, name, lat, lng, address, priceRange]);

      await client.query('DELETE FROM restaurant_tags WHERE restaurant_id = $1', [id]);
      for (const tag of tags) {
        await client.query('INSERT INTO restaurant_tags (restaurant_id, tag) VALUES ($1, $2)', [id, tag]);
      }

      await client.query('COMMIT');
      return await this.getById(id);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};
