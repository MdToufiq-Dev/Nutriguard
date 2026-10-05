import pool from '../pool.js';

export const UserConstraintsModel = {
  async getByUserId(userId) {
    const res = await pool.query(
      'SELECT * FROM user_constraints WHERE user_id = $1',
      [userId]
    );
    return res.rows[0];
  },

  async upsert(userId, constraints) {
    const { goal, diet_type, daily_budget, calorie_target, meal_timings } = constraints;
    const query = `
      INSERT INTO user_constraints (user_id, goal, diet_type, daily_budget, calorie_target, meal_timings, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        goal = EXCLUDED.goal,
        diet_type = EXCLUDED.diet_type,
        daily_budget = EXCLUDED.daily_budget,
        calorie_target = EXCLUDED.calorie_target,
        meal_timings = EXCLUDED.meal_timings,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const values = [userId, goal, diet_type, daily_budget, calorie_target, JSON.stringify(meal_timings)];
    const res = await pool.query(query, values);
    return res.rows[0];
  }
};
