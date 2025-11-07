import AfricasTalking from 'africastalking';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Africa's Talking
const africastalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY || 'YOUR_API_KEY',
  username: process.env.AT_USERNAME || 'sandbox',
});

// Get SMS service
export const sms = africastalking.SMS;

// Get USSD service
export const ussd = africastalking.USSD;

// Send SMS notification
export const sendSMS = async (phoneNumber, message) => {
  try {
    const result = await sms.send({
      to: [phoneNumber],
      message: message,
      from: process.env.AT_SHORTCODE || null
    });
    console.log('✅ SMS sent:', result);
    return result;
  } catch (error) {
    console.error('💥 SMS error:', error);
    throw error;
  }
};

// Send bulk SMS
export const sendBulkSMS = async (phoneNumbers, message) => {
  try {
    const result = await sms.send({
      to: phoneNumbers,
      message: message,
      from: process.env.AT_SHORTCODE || null
    });
    console.log('✅ Bulk SMS sent:', result);
    return result;
  } catch (error) {
    console.error('💥 Bulk SMS error:', error);
    throw error;
  }
};

export default africastalking;