import pool from '../pool.js';

export const MealModel = {
  async getAll() {
    const res = await pool.query('SELECT * FROM meals');
    return res.rows;
  },

  async getById(id) {
    const res = await pool.query('SELECT * FROM meals WHERE id = $1', [id]);
    return res.rows[0];
  },

  async create(meal) {
    const { id, name, meal_type, kcal, protein, carbs, fat, cost, prep_minutes } = meal;
    const query = `
      INSERT INTO meals (id, name, meal_type, kcal, protein, carbs, fat, cost, prep_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [id, name, meal_type, kcal, protein, carbs, fat, cost, prep_minutes];
    const res = await pool.query(query, values);
    return res.rows[0];
  }
};
