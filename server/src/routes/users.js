import express from 'express';
import config from '../config/env.js';
import { UserConstraintsModel } from '../db/models/userConstraints.js';

const router = express.Router();

const canAccessUser = (req, userId) => (
  config.authMode === 'dev' || userId === req.user.id
);

const getConstraints = async (req, res, next, userId) => {
  if (!canAccessUser(req, userId)) {
    return res.status(403).json({ error: { message: 'You cannot access another user\'s constraints' } });
  }

  try {
    const constraints = await UserConstraintsModel.getByUserId(userId);
    if (!constraints) {
      return res.status(404).json({ error: { message: 'Constraints not found' } });
    }
    return res.json(constraints);
  } catch (error) {
    return next(error);
  }
};

const updateConstraints = async (req, res, next, userId) => {
  if (!canAccessUser(req, userId)) {
    return res.status(403).json({ error: { message: 'You cannot modify another user\'s constraints' } });
  }

  try {
    const constraints = await UserConstraintsModel.upsert(userId, req.body);
    return res.json(constraints);
  } catch (error) {
    return next(error);
  }
};

// Authenticated user's preferred endpoints.
router.get('/me/constraints', (req, res, next) => getConstraints(req, res, next, req.user.id));
router.put('/me/constraints', (req, res, next) => updateConstraints(req, res, next, req.user.id));

// Legacy endpoints are retained for development compatibility. In JWT mode they
// can only address the user represented by the verified token.
router.get('/:userId/constraints', (req, res, next) => getConstraints(req, res, next, req.params.userId));
router.put('/:userId/constraints', (req, res, next) => updateConstraints(req, res, next, req.params.userId));

export default router;
