import express from 'express';
import { ComplianceModel } from '../db/models/compliance.js';

const router = express.Router();

// Get Compliance Log & Streak
router.get('/compliance', async (req, res, next) => {
  const userId = req.query.userId || req.user?.id || 'temp-user-id';
  try {
    const logs = await ComplianceModel.getLogByUserId(userId);
    const streak = ComplianceModel.calculateStreak(logs);
    res.json({
      logs,
      streak,
    });
  } catch (error) {
    next(error);
  }
});

// Get Current Streak
router.get('/streak', async (req, res, next) => {
  const userId = req.query.userId || req.user?.id || 'temp-user-id';
  try {
    const logs = await ComplianceModel.getLogByUserId(userId);
    const streak = ComplianceModel.calculateStreak(logs);
    res.json({ streak });
  } catch (error) {
    next(error);
  }
});

// Get Compliance for Specific Date
router.get('/compliance/:date', async (req, res, next) => {
  const userId = req.query.userId || req.user?.id || 'temp-user-id';
  const { date } = req.params;
  try {
    const entry = await ComplianceModel.getByDate(userId, date);
    if (!entry) {
      return res.status(404).json({ error: { message: `No compliance entry for date ${date}` } });
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

// Set Compliance for a Date
router.post('/compliance', async (req, res, next) => {
  const userId = req.body.userId || req.user?.id || 'temp-user-id';
  const { date, status } = req.body;

  if (!date || !status) {
    return res.status(400).json({
      error: { message: 'date and status are required' },
    });
  }

  if (!['followed', 'partial', 'missed'].includes(status)) {
    return res.status(400).json({
      error: { message: "status must be one of: 'followed', 'partial', 'missed'" },
    });
  }

  try {
    const entry = await ComplianceModel.setCompliance(userId, date, status);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

// Delete Compliance for Date
router.delete('/compliance/:date', async (req, res, next) => {
  const userId = req.query.userId || req.user?.id || 'temp-user-id';
  const { date } = req.params;
  try {
    const deleted = await ComplianceModel.deleteByDate(userId, date);
    if (!deleted) {
      return res.status(404).json({ error: { message: 'Entry not found' } });
    }
    res.json({ message: 'Compliance entry deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
