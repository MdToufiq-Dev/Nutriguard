import crypto from 'crypto';
import pool from '../pool.js';

export const PlanMealModel = {
  async getMealsByPlanId(planId) {
    const query = `
      SELECT pm.*, m.*
      FROM plan_meals pm
      JOIN meals m ON pm.meal_id = m.id
      WHERE pm.plan_id = $1
      ORDER BY pm.date, pm.meal_type;
    `;
    const res = await pool.query(query, [planId]);
    return res.rows;
  },

  async swapMeal(planId, oldMealId, newMealId, date, mealType, scheduledTime) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Remove old meal
      await client.query(
        'DELETE FROM plan_meals WHERE plan_id = $1 AND meal_id = $2 AND date = $3 AND meal_type = $4',
        [planId, oldMealId, date, mealType]
      );

      // Add new meal
      const id = crypto.randomUUID(); // Need to ensure crypto is available or use a different ID generation
      await client.query(
        'INSERT INTO plan_meals (id, plan_id, meal_id, date, meal_type, scheduled_time) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, planId, newMealId, date, mealType, scheduledTime]
      );

      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};
