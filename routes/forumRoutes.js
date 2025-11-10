import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAllQuestions,
  getQuestion,
  createQuestion,
  createAnswer,
  vote,
  acceptAnswer
} from '../controllers/forumControllers.js';

const router = express.Router();

// Question routes
router.get('/questions', getAllQuestions);
router.get('/questions/:id', getQuestion);
router.post('/questions', protect, createQuestion);

// Answer routes
router.post('/answers', protect, createAnswer);

// Vote route
router.post('/vote', protect, vote);

// Accept answer route
router.post('/accept-answer', protect, acceptAnswer);

export default router;