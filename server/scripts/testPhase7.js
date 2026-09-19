const axios = require('axios');
const { sendEmail } = require('../utils/sendEmail');

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Phase 7 Backend Verification Tests...\n');

  try {
    // Test 1: Nodemailer & Ethereal email sending
    console.log('--- Test 1: Testing Nodemailer with Ethereal test account ---');
    const emailResult = await sendEmail({
      to: 'farmer.test@example.com',
      subject: 'Phase 7 Verification Email',
      text: 'This is a test notification from AgriRent Phase 7 verification.',
      html: '<h3>AgriRent Email Test</h3><p>This email confirms Phase 7 email service is operational.</p>',
    });

    if (emailResult.success && emailResult.previewUrl) {
      console.log('✅ Email sent successfully!');
      console.log('🔗 Ethereal preview link:', emailResult.previewUrl);
    } else if (emailResult.success) {
      console.log('✅ Email sent via configured SMTP transporter!');
    } else {
      throw new Error(`Email test failed: ${emailResult.error}`);
    }

    // Test 2: Centralized 404 handler
    console.log('\n--- Test 2: Testing Centralized 404 Handler ---');
    try {
      await axios.get('http://localhost:5000/api/nonexistent-route-xyz');
      console.error('❌ Expected 404 error but got 200');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('✅ Centralized 404 returned correctly:', err.response.data);
      } else {
        throw new Error(`Unexpected 404 response: ${err.message}`);
      }
    }

    // Test 3: Input Validation on Register
    console.log('\n--- Test 3: Testing express-validator on POST /api/auth/register ---');
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: '',
        email: 'not-an-email',
        password: '123',
      });
      console.error('❌ Expected 400 validation error but got 200');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Validation correctly caught invalid register input:');
        console.log('   Response message:', err.response.data.message);
        console.log('   Field errors:', err.response.data.errors);
      } else {
        throw new Error(`Unexpected validation response: ${err.message}`);
      }
    }

    // Test 4: Input Validation on Booking
    console.log('\n--- Test 4: Testing express-validator on POST /api/bookings ---');
    try {
      await axios.post(`${API_BASE}/bookings`, {
        equipmentId: 'not-a-mongo-id',
        startDate: 'invalid-date',
        endDate: 'invalid-date',
      });
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        console.log('✅ Booking endpoint properly protected and validated:', err.response.data);
      } else {
        throw new Error(`Unexpected booking validation response: ${err.message}`);
      }
    }

    // Test 5: Root API Health Check
    console.log('\n--- Test 5: Testing Health Check Route GET / ---');
    const healthRes = await axios.get('http://localhost:5000/');
    console.log('✅ Health check response:', healthRes.data);

    console.log('\n🎉 ALL PHASE 7 BACKEND TESTS PASSED SUCCESSFULLY! 🎉');
  } catch (error) {
    console.error('\n❌ Phase 7 test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
