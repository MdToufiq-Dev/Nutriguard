import crypto from 'crypto';
import pool from '../pool.js';

const asDateString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
};

const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const toPlanDto = (row) => {
  const data = row.plan_data && typeof row.plan_data === 'object' ? row.plan_data : {};
  return {
    ...data,
    id: row.id,
    userId: row.user_id,
    goal: row.goal,
    dietType: row.diet_type,
    duration: row.duration,
    dailyBudget: Number(row.daily_budget),
    calorieTarget: row.calorie_target,
    startDate: asDateString(row.start_date),
    endDate: asDateString(row.end_date),
    status: row.status || data.status || 'active',
    createdAt: row.created_at,
  };
};

const normalizePlan = (userId, plan, existing = {}) => {
  const dietType = plan.dietType ?? plan.diet_type ?? existing.dietType ?? existing.diet_type ?? 'any';
  const duration = Number(plan.duration ?? existing.duration ?? plan.days?.length ?? 7);
  const calorieTarget = Number(plan.calorieTarget ?? plan.calorie_target ?? existing.calorieTarget ?? existing.calorie_target ?? 2000);
  const dailyBudget = Number(plan.dailyBudget ?? plan.daily_budget ?? existing.dailyBudget ?? existing.daily_budget ?? 0);
  const startDate = asDateString(plan.startDate ?? plan.start_date ?? existing.startDate ?? existing.start_date)
    || new Date().toISOString().slice(0, 10);
  const endDate = asDateString(plan.endDate ?? plan.end_date ?? existing.endDate ?? existing.end_date)
    || addDays(startDate, Math.max(duration - 1, 0));
  const id = plan.id || existing.id || `plan_${crypto.randomUUID()}`;
  const status = plan.status || existing.status || 'active';

  return {
    id,
    userId,
    goal: plan.goal ?? existing.goal ?? 'nutrition',
    dietType,
    duration: Number.isFinite(duration) && duration > 0 ? duration : 7,
    dailyBudget: Number.isFinite(dailyBudget) ? dailyBudget : 0,
    calorieTarget: Number.isFinite(calorieTarget) && calorieTarget > 0 ? calorieTarget : 2000,
    startDate,
    endDate,
    status,
  };
};

export const PlanModel = {
  async create(userId, plan) {
    const normalized = normalizePlan(userId, plan);
    const planData = {
      ...plan,
      id: normalized.id,
      userId,
      goal: normalized.goal,
      dietType: normalized.dietType,
      duration: normalized.duration,
      dailyBudget: normalized.dailyBudget,
      calorieTarget: normalized.calorieTarget,
      startDate: normalized.startDate,
      endDate: normalized.endDate,
      status: normalized.status,
    };

    const query = `
      INSERT INTO plans
        (id, user_id, goal, diet_type, duration, daily_budget, calorie_target,
         start_date, end_date, plan_data, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      normalized.id,
      userId,
      normalized.goal,
      normalized.dietType,
      normalized.duration,
      normalized.dailyBudget,
      normalized.calorieTarget,
      normalized.startDate,
      normalized.endDate,
      JSON.stringify(planData),
      normalized.status,
    ];
    const res = await pool.query(query, values);
    return toPlanDto(res.rows[0]);
  },

  async listByUserId(userId) {
    const res = await pool.query(
      'SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows.map(toPlanDto);
  },

  async getById(userId, planId) {
    const res = await pool.query(
      'SELECT * FROM plans WHERE id = $1 AND user_id = $2',
      [planId, userId]
    );
    return res.rows[0] ? toPlanDto(res.rows[0]) : null;
  },

  async getActiveByUserId(userId) {
    const res = await pool.query(
      `SELECT * FROM plans
       WHERE user_id = $1 AND status IN ('active', 'draft') AND end_date >= CURRENT_DATE
       ORDER BY start_date DESC LIMIT 1`,
      [userId]
    );
    return res.rows[0] ? toPlanDto(res.rows[0]) : null;
  },

  async activate(userId, planId, startDate) {
    const result = await pool.query(
      'SELECT * FROM plans WHERE id = $1 AND user_id = $2',
      [planId, userId]
    );
    const row = result.rows[0];
    if (!row) return null;

    const dto = toPlanDto(row);
    const normalizedStart = asDateString(startDate) || new Date().toISOString().slice(0, 10);
    const normalizedEnd = addDays(normalizedStart, Math.max(dto.duration - 1, 0));
    const planData = {
      ...(row.plan_data || {}),
      id: row.id,
      userId,
      startDate: normalizedStart,
      endDate: normalizedEnd,
      status: 'active',
      days: Array.isArray(row.plan_data?.days)
        ? row.plan_data.days.map((day, index) => ({
            ...day,
            date: addDays(normalizedStart, index),
          }))
        : row.plan_data?.days,
    };

    const updated = await pool.query(
      `UPDATE plans
       SET start_date = $1, end_date = $2, status = 'active', plan_data = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [normalizedStart, normalizedEnd, JSON.stringify(planData), planId, userId]
    );
    return toPlanDto(updated.rows[0]);
  },

  async update(userId, planId, updates) {
    const result = await pool.query(
      'SELECT * FROM plans WHERE id = $1 AND user_id = $2',
      [planId, userId]
    );
    const row = result.rows[0];
    if (!row) return null;

    const existing = toPlanDto(row);
    const normalized = normalizePlan(userId, { ...existing, ...updates, id: planId }, existing);
    const planData = {
      ...(row.plan_data || {}),
      ...updates,
      id: planId,
      userId,
      dietType: normalized.dietType,
      calorieTarget: normalized.calorieTarget,
      duration: normalized.duration,
      dailyBudget: normalized.dailyBudget,
      startDate: normalized.startDate,
      endDate: normalized.endDate,
      status: normalized.status,
    };

    const updated = await pool.query(
      `UPDATE plans
       SET goal = $1, diet_type = $2, duration = $3, daily_budget = $4,
           calorie_target = $5, start_date = $6, end_date = $7,
           plan_data = $8, status = $9
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [normalized.goal, normalized.dietType, normalized.duration, normalized.dailyBudget,
        normalized.calorieTarget, normalized.startDate, normalized.endDate,
        JSON.stringify(planData), normalized.status, planId, userId]
    );
    return toPlanDto(updated.rows[0]);
  },

  async delete(userId, planId) {
    const result = await pool.query(
      'DELETE FROM plans WHERE id = $1 AND user_id = $2 RETURNING id',
      [planId, userId]
    );
    return result.rowCount > 0;
  },

  async getToday(userId) {
    const plan = await this.getActiveByUserId(userId);
    if (!plan) return null;
    const today = new Date().toISOString().slice(0, 10);
    return {
      plan,
      day: plan.days?.find((entry) => entry.date === today) || null,
    };
  },

  async swapMeal(userId, dayNumber, mealId, newMeal) {
    const result = await pool.query(
      `SELECT * FROM plans
       WHERE user_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE
       ORDER BY start_date DESC LIMIT 1`,
      [userId]
    );
    const row = result.rows[0];
    if (!row) return null;

    const planData = { ...(row.plan_data || {}) };

    // Deep clone days
    const days = Array.isArray(planData.days)
      ? planData.days.map((day) => ({
          ...day,
          meals: Array.isArray(day.meals) ? [...day.meals] : []
        }))
      : [];

    const day = days.find((entry) => Number(entry.dayNumber) === Number(dayNumber));
    if (day?.meals) {
      const index = day.meals.findIndex((meal) => meal.id === mealId);
      if (index >= 0 && newMeal && newMeal.id !== mealId) {
        day.meals[index] = { ...newMeal };
      }
    }

    const updated = await pool.query(
      'UPDATE plans SET plan_data = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [JSON.stringify({ ...planData, days }), row.id, userId]
    );
    return toPlanDto(updated.rows[0]);
  },

  async clearPlan(userId) {
    const result = await pool.query(
      `SELECT * FROM plans
       WHERE user_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE
       ORDER BY start_date DESC LIMIT 1`,
      [userId]
    );
    const row = result.rows[0];
    if (!row) return null;

    const planData = { ...(row.plan_data || {}), days: [] };
    console.log("Backend clearPlan planData:", planData);

    const updated = await pool.query(
      'UPDATE plans SET plan_data = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [JSON.stringify(planData), row.id, userId]
    );
    return toPlanDto(updated.rows[0]);
  },
};
