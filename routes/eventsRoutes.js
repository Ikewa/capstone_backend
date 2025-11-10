import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllEvents,
  getEvent,
  createEvent,
  registerForEvent,
  cancelRegistration,
  getMyEvents,
  getEventRegistrations,
  updateEvent,
  deleteEvent,
  unregisterFromEvent,
  checkRegistrationStatus
} from "../controllers/eventsController.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEvent);

// Protected routes (all authenticated users)
router.post("/register", protect, registerForEvent);
router.post("/cancel", protect, cancelRegistration);

// Event registration routes (better paths)
router.post('/:eventId/register', protect, registerForEvent);
router.delete('/:eventId/register', protect, unregisterFromEvent);
router.get('/:eventId/registration-status', protect, checkRegistrationStatus);

// Officer-only routes
router.post("/", protect, createEvent);
router.get("/my/events", protect, getMyEvents);
router.get("/:id/registrations", protect, getEventRegistrations);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;