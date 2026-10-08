import { describe, it, expect, beforeEach } from 'vitest';
import { UserConstraintsModel } from '../db/models/userConstraints.js';
import { PlanModel } from '../db/models/plan.js';
import { MealModel } from '../db/models/meal.js';
import { PlanMealModel } from '../db/models/planMeal.js';
import pool from '../db/pool.js';

describe('Plans and Constraints', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM plan_meals');
    await pool.query('DELETE FROM plans');
    await pool.query('DELETE FROM meals');
    await pool.query('DELETE FROM user_constraints');
    await pool.query('DELETE FROM users WHERE id = $1 OR email = $2', ['temp-user-id', 'test@example.com']);
    await pool.query(
      'INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email',
      ['temp-user-id', 'test@example.com']
    );
  });

  it('should upsert and retrieve user constraints', async () => {
    const constraints = {
      goal: 'weight-loss',
      diet_type: 'vegan',
      daily_budget: 15.00,
      calorie_target: 2000,
      meal_timings: { breakfast: '08:00', lunch: '13:00', dinner: '19:00' }
    };

    await UserConstraintsModel.upsert('temp-user-id', constraints);
    const retrieved = await UserConstraintsModel.getByUserId('temp-user-id');

    expect(retrieved.goal).toBe('weight-loss');
    expect(retrieved.diet_type).toBe('vegan');
    expect(Number(retrieved.daily_budget)).toBe(15.00);
  });

  it('should create and retrieve an active plan', async () => {
    const plan = {
      id: 'plan-1',
      goal: 'weight-loss',
      diet_type: 'vegan',
      duration: 30,
      daily_budget: 15.00,
      calorie_target: 2000,
      start_date: '2026-10-01',
      end_date: '2026-10-31'
    };

    await PlanModel.create('temp-user-id', plan);
    const activePlan = await PlanModel.getActiveByUserId('temp-user-id');

    expect(activePlan.id).toBe('plan-1');
  });

  it('should create meals and assign to plan', async () => {
    const meal = {
      id: 'meal-1',
      name: 'Oatmeal & Berries',
      meal_type: 'breakfast',
      kcal: 350,
      protein: 12,
      carbs: 60,
      fat: 6,
      cost: 3.50,
      prep_minutes: 10
    };

    await MealModel.create(meal);
    const createdMeal = await MealModel.getById('meal-1');
    expect(createdMeal.name).toBe('Oatmeal & Berries');

    const plan = {
      id: 'plan-2',
      goal: 'maintenance',
      diet_type: 'vegetarian',
      duration: 7,
      daily_budget: 20.00,
      calorie_target: 2200,
      start_date: '2026-10-01',
      end_date: '2026-10-07'
    };
    await PlanModel.create('temp-user-id', plan);

    await pool.query(
      'INSERT INTO plan_meals (id, plan_id, meal_id, date, meal_type, scheduled_time) VALUES ($1, $2, $3, $4, $5, $6)',
      ['pm-1', 'plan-2', 'meal-1', '2026-10-01', 'breakfast', '08:00']
    );

    const planMeals = await PlanMealModel.getMealsByPlanId('plan-2');
    expect(planMeals.length).toBe(1);
    expect(planMeals[0].name).toBe('Oatmeal & Berries');
  });
});
