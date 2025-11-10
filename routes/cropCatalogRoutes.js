import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAllCrops,
  getCrop,
  createCrop,
  getCropRecommendations,
  uploadCropImageController
} from '../controllers/cropCatalogController.js';
import { uploadCropImage } from '../middleware/uploadMiddleware.js';  // ← ADD THIS IMPORT

const router = express.Router();

// Public routes
router.get('/', getAllCrops);
router.get('/recommendations', protect, getCropRecommendations);
router.get('/:id', getCrop);

// Protected routes (for adding crops)
router.post('/', protect, createCrop);

// Image upload route
router.post('/upload-image', protect, uploadCropImage.single('image'), uploadCropImageController);

export default router;