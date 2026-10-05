import pool from '../pool.js';

export const PlanModel = {
  async create(userId, plan) {
    const { id, goal, diet_type, duration, daily_budget, calorie_target, start_date, end_date } = plan;
    const query = `
      INSERT INTO plans (id, user_id, goal, diet_type, duration, daily_budget, calorie_target, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [id, userId, goal, diet_type, duration, daily_budget, calorie_target, start_date, end_date];
    const res = await pool.query(query, values);
    return res.rows[0];
  },

  async getActiveByUserId(userId) {
    const res = await pool.query(
      'SELECT * FROM plans WHERE user_id = $1 AND end_date >= CURRENT_DATE ORDER BY start_date DESC LIMIT 1',
      [userId]
    );
    return res.rows[0];
  }
};
