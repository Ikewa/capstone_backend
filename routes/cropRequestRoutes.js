import express from 'express';
import {
  submitCropRequest,
  getMyRequests,
  getRequestById,
  getPendingRequests,
  provideRecommendation,
  deleteRequest,
  uploadRequestImagesController
} from '../controllers/cropRequestsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadRequestImages } from '../middleware/uploadMiddleware.js';  // ← ADD THIS IMPORT

const router = express.Router();

// All routes require authentication
router.post('/', protect, submitCropRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/pending/all', protect, getPendingRequests);
router.get('/:id', protect, getRequestById);
router.post('/:id/respond', protect, provideRecommendation);
router.delete('/:id', protect, deleteRequest);

// Image upload route (up to 5 images)
router.post('/upload-images', protect, uploadRequestImages.array('images', 5), uploadRequestImagesController);

export default router;