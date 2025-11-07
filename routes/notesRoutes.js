import express from 'express';
import {
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/notesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.get('/', protect, getAllNotes);
router.get('/:id', protect, getNote);
router.post('/', protect, createNote);
router.put('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);

export default router;