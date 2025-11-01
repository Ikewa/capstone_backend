import express from 'express';
import {
  getAllGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMessages,
  postMessage,
  reactToMessage,
  deleteMessage,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  removeMember,
  makeAdmin,
  removeAdmin
} from '../controllers/discussionGroupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== GROUP ROUTES ====================

// Get all groups (with filters)
router.get('/', protect, getAllGroups);

// Get single group details
router.get('/:id', protect, getGroup);

// Create new group (Extension Officers only)
router.post('/', protect, createGroup);

// Update group (Admins only)
router.put('/:id', protect, updateGroup);

// Delete group (Admins only)
router.delete('/:id', protect, deleteGroup);

// ==================== MESSAGE ROUTES ====================

// Get group messages
router.get('/:id/messages', protect, getGroupMessages);

// Post message to group
router.post('/:id/messages', protect, postMessage);

// React to message (like/unlike)
router.post('/messages/:messageId/react', protect, reactToMessage);

// Delete message (Author or Admin)
router.delete('/messages/:messageId', protect, deleteMessage);

// ==================== MEMBER ROUTES ====================

// Get group members
router.get('/:id/members', protect, getGroupMembers);

// Join group
router.post('/:id/join', protect, joinGroup);

// Leave group
router.post('/:id/leave', protect, leaveGroup);

// Remove member from group (Admin only)
router.delete('/:id/members/:memberId', protect, removeMember);

// Make member admin (Admin only)
router.post('/:id/members/:memberId/make-admin', protect, makeAdmin);

// Remove admin status (Admin only)
router.post('/:id/members/:memberId/remove-admin', protect, removeAdmin);

export default router;