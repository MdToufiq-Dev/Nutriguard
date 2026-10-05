import express from 'express';
import { UserConstraintsModel } from '../db/models/userConstraints.js';
import { PlanModel } from '../db/models/plan.js';
import { PlanMealModel } from '../db/models/planMeal.js';

const router = express.Router();

// Get User Constraints
router.get('/constraints', async (req, res, next) => {
  const userId = req.user?.id || 'temp-user-id';
  try {
    const constraints = await UserConstraintsModel.getByUserId(userId);
    if (!constraints) {
      return res.status(404).json({ error: { message: 'Constraints not found' } });
    }
    res.json(constraints);
  } catch (error) {
    next(error);
  }
});

// Update/Create User Constraints
router.post('/constraints', async (req, res, next) => {
  const userId = req.user?.id || 'temp-user-id';
  try {
    const constraints = await UserConstraintsModel.upsert(userId, req.body);
    res.status(201).json(constraints);
  } catch (error) {
    next(error);
  }
});

// Get Active Plan
router.get('/active', async (req, res, next) => {
  const userId = req.user?.id || 'temp-user-id';
  try {
    const plan = await PlanModel.getActiveByUserId(userId);
    if (!plan) {
      return res.status(404).json({ error: { message: 'No active plan found' } });
    }
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// Create Plan
router.post('/', async (req, res, next) => {
  const userId = req.user?.id || 'temp-user-id';
  try {
    const plan = await PlanModel.create(userId, req.body);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

// Get Plan Meals
router.get('/:planId/meals', async (req, res, next) => {
  try {
    const meals = await PlanMealModel.getMealsByPlanId(req.params.planId);
    res.json(meals);
  } catch (error) {
    next(error);
  }
});

// Swap Meal
router.post('/:planId/meals/:mealId/swap', async (req, res, next) => {
  const { planId, mealId: oldMealId } = req.params;
  const { newMealId, date, mealType, scheduledTime } = req.body;
  try {
    await PlanMealModel.swapMeal(planId, oldMealId, newMealId, date, mealType, scheduledTime);
    res.json({ message: 'Meal swapped successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
