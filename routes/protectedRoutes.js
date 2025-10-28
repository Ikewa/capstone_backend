import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getHome,
  getNotifications,
  getCrop,
  getBooking,
  getEvents,
  getMap,
  getSettings
} from "../controllers/protectedControllers.js";

const router = express.Router();

// All routes here require authentication
router.get("/Home", protect, getHome);
router.get("/Notifications", protect, getNotifications);
router.get("/Crop", protect, getCrop);
router.get("/Booking", protect, getBooking);
router.get("/Events", protect, getEvents);
router.get("/Map", protect, getMap);
router.get("/Settings", protect, getSettings);

export default router;