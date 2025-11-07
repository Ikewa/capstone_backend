import { sendSMS } from '../config/africastalking.js';

// Send SMS when question is answered
export const notifyQuestionAnswered = async (phoneNumber, questionTitle, answerPreview) => {
  const message = `AgriConnect: Your question "${questionTitle}" has a new answer! ${answerPreview}... Login to view full answer.`;
  return await sendSMS(phoneNumber, message);
};

// Send SMS for event reminder
export const notifyEventReminder = async (phoneNumber, eventTitle, eventDate) => {
  const message = `AgriConnect: Reminder! Event "${eventTitle}" is on ${eventDate}. Don't miss it!`;
  return await sendSMS(phoneNumber, message);
};

// Send SMS for booking confirmation
export const notifyBookingConfirmed = async (phoneNumber, bookingDate, officerName) => {
  const message = `AgriConnect: Your consultation with ${officerName} on ${bookingDate} is confirmed!`;
  return await sendSMS(phoneNumber, message);
};

// Send SMS for booking status change
export const notifyBookingStatusChange = async (phoneNumber, status, bookingDate) => {
  const message = `AgriConnect: Your consultation booking for ${bookingDate} has been ${status}.`;
  return await sendSMS(phoneNumber, message);
};

// Send welcome SMS
export const sendWelcomeSMS = async (phoneNumber, userName) => {
  const message = `Welcome to AgriConnect, ${userName}! Dial *384*1234# to access farming tips, crop prices, and more. Thank you for joining!`;
  return await sendSMS(phoneNumber, message);
};