import express from 'express';
import { UserConstraintsModel } from '../db/models/userConstraints.js';
import { PlanModel } from '../db/models/plan.js';

const router = express.Router();

// Get User Constraints
router.get('/constraints', async (req, res, next) => {
  const userId = req.user.id;
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
  const userId = req.user.id;
  try {
    const constraints = await UserConstraintsModel.upsert(userId, req.body);
    res.status(201).json(constraints);
  } catch (error) {
    next(error);
  }
});

// Get all plans for the authenticated user.
router.get('/', async (req, res, next) => {
  try {
    res.json(await PlanModel.listByUserId(req.user.id));
  } catch (error) {
    next(error);
  }
});

// Get Active Plan
router.get('/active', async (req, res, next) => {
  try {
    const plan = await PlanModel.getActiveByUserId(req.user.id);
    if (!plan) {
      return res.status(404).json({ error: { message: 'No active plan found' } });
    }
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// Get today's meals from the authenticated user's active plan.
router.get('/today', async (req, res, next) => {
  try {
    const result = await PlanModel.getToday(req.user.id);
    if (!result) {
      return res.status(404).json({ error: { message: 'No active plan found' } });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Swap a meal in the authenticated user's active plan.
router.post('/swap-meal', async (req, res, next) => {
  try {
    const { dayNumber, mealId, newMeal } = req.body || {};
    if (!dayNumber || !mealId || !newMeal) {
      return res.status(400).json({ error: { message: 'dayNumber, mealId, and newMeal are required' } });
    }
    const plan = await PlanModel.swapMeal(req.user.id, dayNumber, mealId, newMeal);
    if (!plan) {
      return res.status(404).json({ error: { message: 'Active plan not found' } });
    }
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// Clear the authenticated user's active plan.
router.post('/clear', async (req, res, next) => {
  try {
    const plan = await PlanModel.clearPlan(req.user.id);
    if (!plan) {
      return res.status(404).json({ error: { message: 'Active plan not found' } });
    }
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// Create Plan. Ownership always comes from the verified token.
router.post('/', async (req, res, next) => {
  try {
    const plan = await PlanModel.create(req.user.id, req.body || {});
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

// Get one plan belonging to the authenticated user.
router.get('/:planId', async (req, res, next) => {
  try {
    const plan = await PlanModel.getById(req.user.id, req.params.planId);
    if (!plan) return res.status(404).json({ error: { message: 'Plan not found' } });
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// Update one plan belonging to the authenticated user.
router.put('/:planId', async (req, res, next) => {
  try {
    const plan = await PlanModel.update(req.user.id, req.params.planId, req.body || {});
    if (!plan) return res.status(404).json({ error: { message: 'Plan not found' } });
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// Activate one plan belonging to the authenticated user.
router.post('/:planId/activate', async (req, res, next) => {
  try {
    const plan = await PlanModel.activate(req.user.id, req.params.planId, req.body?.startDate);
    if (!plan) return res.status(404).json({ error: { message: 'Plan not found' } });
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// Delete one plan belonging to the authenticated user.
router.delete('/:planId', async (req, res, next) => {
  try {
    const deleted = await PlanModel.delete(req.user.id, req.params.planId);
    if (!deleted) return res.status(404).json({ error: { message: 'Plan not found' } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
