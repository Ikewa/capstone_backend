import express from 'express';
import { handleUSSD } from '../controllers/ussdController.js';

const router = express.Router();

// USSD callback endpoint (Africa's Talking will POST here)
router.post('/ussd', handleUSSD);

// Test endpoint (for manual testing)
router.post('/ussd/test', handleUSSD);

export default router;