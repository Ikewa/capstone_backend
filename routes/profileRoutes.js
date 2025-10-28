import express from 'express';
import {
  getUserProfile,
  getMyProfile,
  updateProfile,
  changePassword,
  updateAvatar
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/:id', getUserProfile);

// Protected routes
router.get('/me/profile', protect, getMyProfile);
router.put('/me/profile', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.put('/me/avatar', protect, updateAvatar);

export default router;