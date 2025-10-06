import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/Home", protect, (req, res) => {
  res.json({ message: "Welcome to Home!", user: req.user });
});

router.get("/Notifications", protect, (req, res) => {
  res.json({ message: "Welcome to Notifications!", user: req.user });
});

router.get("/Crop", protect, (req, res) => {
  res.json({ message: "Welcome to Crop!", user: req.user });
});

router.get("/Booking", protect, (req, res) => {
  res.json({ message: "Welcome to Booking!", user: req.user });
});

router.get("/Events", protect, (req, res) => {
  res.json({ message: "Welcome to Events!", user: req.user });
});

router.get("/Map", protect, (req, res) => {
  res.json({ message: "Welcome to Map!", user: req.user });
});

router.get("/Sett", protect, (req, res) => {
  res.json({ message: "Welcome to Settings!", user: req.user });
});

export default router;
