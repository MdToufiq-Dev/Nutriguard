import pool from '../pool.js';

export const ProductModel = {
  async getByBarcode(barcode) {
    const res = await pool.query(
      `SELECT p.barcode, p.product_name as name, p.brand, p.image_url as "imageUrl",
              p.ingredients, p.nutrition,
              COALESCE(ARRAY_AGG(pa.allergen) FILTER (WHERE pa.allergen IS NOT NULL), '{}') as allergens
       FROM products p
       LEFT JOIN product_allergens pa ON p.barcode = pa.barcode
       WHERE p.barcode = $1
       GROUP BY p.barcode, p.product_name, p.brand, p.image_url, p.ingredients, p.nutrition`,
      [barcode]
    );
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      barcode: row.barcode,
      name: row.name,
      brand: row.brand,
      imageUrl: row.imageUrl,
      ingredients: row.ingredients,
      kcal: row.nutrition?.kcal || 0,
      protein: row.nutrition?.protein || 0,
      carbs: row.nutrition?.carbs || 0,
      fat: row.nutrition?.fat || 0,
      allergens: row.allergens || [],
      tags: row.nutrition?.tags || [],
    };
  },

  async upsert(product) {
    const { barcode, name, brand, imageUrl, ingredients, kcal, protein, carbs, fat, allergens = [], tags = [] } = product;
    const nutrition = { kcal, protein, carbs, fat, tags };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO products (barcode, product_name, brand, image_url, ingredients, nutrition)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (barcode) DO UPDATE SET
          product_name = EXCLUDED.product_name,
          brand = EXCLUDED.brand,
          image_url = EXCLUDED.image_url,
          ingredients = EXCLUDED.ingredients,
          nutrition = EXCLUDED.nutrition
        RETURNING *;
      `;
      await client.query(query, [barcode, name, brand, imageUrl, ingredients, JSON.stringify(nutrition)]);

      // Delete existing allergens and re-insert
      await client.query('DELETE FROM product_allergens WHERE barcode = $1', [barcode]);
      for (const allergen of allergens) {
        await client.query('INSERT INTO product_allergens (barcode, allergen) VALUES ($1, $2)', [barcode, allergen]);
      }

      await client.query('COMMIT');
      return await this.getByBarcode(barcode);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async recordScan(userId, barcode, productName, verdict) {
    const id = `scan_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const query = `
      INSERT INTO scan_history (id, user_id, barcode, product_name, verdict, scanned_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, user_id as "userId", barcode, product_name as "productName", verdict, scanned_at as "scannedAt";
    `;
    const res = await pool.query(query, [id, userId, barcode, productName, verdict]);
    return res.rows[0];
  },

  async getScanHistory(userId, limit = 50) {
    const query = `
      SELECT sh.id, sh.user_id as "userId", sh.barcode, sh.product_name as "productName",
             sh.verdict, sh.scanned_at as "scannedAt",
             p.brand, p.nutrition
      FROM scan_history sh
      LEFT JOIN products p ON sh.barcode = p.barcode
      WHERE sh.user_id = $1
      ORDER BY sh.scanned_at DESC
      LIMIT $2;
    `;
    const res = await pool.query(query, [userId, limit]);
    return res.rows.map(row => ({
      id: row.id,
      userId: row.userId,
      barcode: row.barcode,
      productName: row.productName,
      brand: row.brand,
      verdict: row.verdict,
      scannedAt: row.scannedAt,
      kcal: row.nutrition?.kcal || 0,
      protein: row.nutrition?.protein || 0,
      carbs: row.nutrition?.carbs || 0,
      fat: row.nutrition?.fat || 0,
    }));
  }
};
