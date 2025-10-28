import express from 'express';
import {
  createBooking,
  getMyBookings,
  getPendingBookings,
  getMyAppointments,
  acceptBooking,
  declineBooking,
  cancelBooking,
  getBookingById
} from '../controllers/bookingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Farmer routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Officer routes
router.get('/pending', protect, getPendingBookings);
router.get('/my-appointments', protect, getMyAppointments);
router.put('/:id/accept', protect, acceptBooking);
router.put('/:id/decline', protect, declineBooking);

// Shared routes
router.get('/:id', protect, getBookingById);

export default router;