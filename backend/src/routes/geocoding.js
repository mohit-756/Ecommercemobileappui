import { Router } from 'express';
import { reverseGeocode, searchAddresses } from '../services/geocodingService.js';

const router = Router();

router.get('/reverse', async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng query params are required' });
    }
    const result = await reverseGeocode(lat, lng);
    if (!result) {
      return res.status(404).json({ message: 'No address found for these coordinates' });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.status(400).json({ message: 'Query param "q" must be at least 3 characters' });
    }
    const results = await searchAddresses(q);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
