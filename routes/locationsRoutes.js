import express from 'express';
import {
  getAllLocations,
  getNearbyLocations,
  getLocationById,
  getStatesWithLocations,
  addLocation
} from '../controllers/locationsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (all users can view)
router.get('/', getAllLocations);
router.get('/nearby', getNearbyLocations);
router.get('/states', getStatesWithLocations);
router.get('/:id', getLocationById);

// Protected route (for adding locations - future feature)
router.post('/', protect, addLocation);

export default router;