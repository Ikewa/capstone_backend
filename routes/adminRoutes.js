import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  makeAdmin,
  removeAdmin,
  deleteQuestion,
  deleteAnswer,
  deleteEvent,
  deleteDiscussionGroup,
  createAdmin,
  getAllEvents,
  getAllGroups,
  deleteCrop,
  getEventParticipants, 
  removeEventParticipant
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// All admin routes require authentication AND admin privileges
router.use(protect, adminOnly);

// ==================== DASHBOARD ====================
router.get('/stats', getDashboardStats);

// ==================== USER MANAGEMENT ====================
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/make-admin', makeAdmin);
router.post('/users/:id/remove-admin', removeAdmin);

// ==================== CONTENT MODERATION ====================
router.delete('/questions/:id', deleteQuestion);
router.delete('/answers/:id', deleteAnswer);
router.delete('/events/:id', deleteEvent);
router.delete('/discussion-groups/:id', deleteDiscussionGroup);

// ==================== ADMIN MANAGEMENT ====================
router.post('/create-admin', createAdmin);  
router.get('/dashboard/stats', protect, adminOnly, getDashboardStats);
router.get('/events', protect, adminOnly, getAllEvents);
router.get('/groups', protect, adminOnly, getAllGroups);
router.delete('/crops/:id', protect, adminOnly, deleteCrop);

// ==================== CONTENT MANAGEMENT ====================
router.get('/events', protect, adminOnly, getAllEvents);
router.get('/events/:eventId/participants', protect, adminOnly, getEventParticipants);  // ← ADD
router.delete('/events/:eventId/participants/:userId', protect, adminOnly, removeEventParticipant);  // ← ADD
router.get('/groups', protect, adminOnly, getAllGroups);
router.delete('/questions/:id', protect, adminOnly, deleteQuestion);
router.delete('/answers/:id', protect, adminOnly, deleteAnswer);
router.delete('/events/:id', protect, adminOnly, deleteEvent);
router.delete('/groups/:id', protect, adminOnly, deleteDiscussionGroup);
router.delete('/crops/:id', protect, adminOnly, deleteCrop);

export default router;