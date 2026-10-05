import express from 'express';
import { UserConstraintsModel } from '../db/models/userConstraints.js';

const router = express.Router();

// Get Constraints
router.get('/:userId/constraints', async (req, res, next) => {
  try {
    const constraints = await UserConstraintsModel.getByUserId(req.params.userId);
    if (!constraints) {
      return res.status(404).json({ error: { message: 'Constraints not found' } });
    }
    res.json(constraints);
  } catch (error) {
    next(error);
  }
});

// Update Constraints
router.put('/:userId/constraints', async (req, res, next) => {
  try {
    const constraints = await UserConstraintsModel.upsert(req.params.userId, req.body);
    res.json(constraints);
  } catch (error) {
    next(error);
  }
});

export default router;
