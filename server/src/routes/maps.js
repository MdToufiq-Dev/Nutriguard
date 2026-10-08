import express from 'express';
import { geocodeAddress } from '../services/geocodingService.js';

const router = express.Router();

// Geocode address
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    const location = await geocodeAddress(address);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
