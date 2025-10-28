import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllQuestions,
  getQuestion,
  createQuestion,
  createAnswer,
  vote,
  acceptAnswer
} from "../controllers/forumControllers.js";

const router = express.Router();

// Public routes
router.get("/questions", getAllQuestions);
router.get("/questions/:id", getQuestion);

// Protected routes (require authentication)
router.post("/questions", protect, createQuestion);
router.post("/answers", protect, createAnswer);
router.post("/vote", protect, vote);
router.post("/accept-answer", protect, acceptAnswer);

export default router;