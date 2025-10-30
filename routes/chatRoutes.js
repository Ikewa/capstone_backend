import express from 'express';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  blockUser,
  unblockUser,
  getBlockedUsers,
  checkIfBlocked,
  deleteConversation
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.post('/conversation', protect, getOrCreateConversation);
router.get('/conversations', protect, getConversations);
router.get('/messages/:conversation_id', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.get('/unread', protect, getUnreadCount);

// Blocking features
router.post('/block', protect, blockUser);
router.post('/unblock', protect, unblockUser);
router.get('/blocked', protect, getBlockedUsers);
router.get('/blocked/:user_id', protect, checkIfBlocked);

// Delete conversation
router.delete('/conversation/:conversation_id', protect, deleteConversation);

export default router;