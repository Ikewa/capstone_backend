import express from 'express';
import { 
  getCropRecommendations, 
  getAllCrops, 
  getCropById 
} from '../controllers/cropCatalogController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get personalized crop recommendations (requires auth to get user location)
router.get('/recommendations', protect, getCropRecommendations);

// Get all crops (public)
router.get('/all', getAllCrops);

// Get single crop details
router.get('/:id', getCropById);

export default router;