import express from 'express';
import {
  submitCropRequest,
  getMyRequests,
  getRequestById,
  getPendingRequests,
  provideRecommendation,
  deleteRequest
} from '../controllers/cropRequestsController.js';
import { protect } from '../middleware/authMiddleware.js'; 
const router = express.Router();

// All routes require authentication
router.post('/', protect, submitCropRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/pending/all', protect, getPendingRequests);
router.get('/:id', protect, getRequestById);
router.post('/:id/respond', protect, provideRecommendation);
router.delete('/:id', protect, deleteRequest);

export default router;