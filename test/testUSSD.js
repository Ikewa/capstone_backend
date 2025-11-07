import axios from 'axios';

const testUSSD = async () => {
  const baseURL = 'http://localhost:5000/api/ussd/test';

  console.log('🧪 Testing USSD Service...\n');

  // Test 1: Main Menu
  console.log('Test 1: Main Menu');
  let response = await axios.post(baseURL, {
    sessionId: 'test-session-001',
    serviceCode: '*384*1234#',
    phoneNumber: '+2348012345678',
    text: ''
  });
  console.log(response.data);
  console.log('\n---\n');

  // Test 2: View Crop Prices
  console.log('Test 2: View Crop Prices Menu');
  response = await axios.post(baseURL, {
    sessionId: 'test-session-002',
    serviceCode: '*384*1234#',
    phoneNumber: '+2348012345678',
    text: '1'
  });
  console.log(response.data);
  console.log('\n---\n');

  // Test 3: Rice Prices
  console.log('Test 3: Rice Prices');
  response = await axios.post(baseURL, {
    sessionId: 'test-session-003',
    serviceCode: '*384*1234#',
    phoneNumber: '+2348012345678',
    text: '1*1'
  });
  console.log(response.data);
  console.log('\n---\n');

  // Test 4: Upcoming Events
  console.log('Test 4: Upcoming Events');
  response = await axios.post(baseURL, {
    sessionId: 'test-session-004',
    serviceCode: '*384*1234#',
    phoneNumber: '+2348012345678',
    text: '5'
  });
  console.log(response.data);
  console.log('\n---\n');

  // Test 5: Register
  console.log('Test 5: Register Menu');
  response = await axios.post(baseURL, {
    sessionId: 'test-session-005',
    serviceCode: '*384*1234#',
    phoneNumber: '+2348012345678',
    text: '7*1'
  });
  console.log(response.data);
  console.log('\n---\n');

  console.log('✅ Testing complete!');
};

testUSSD().catch(console.error);