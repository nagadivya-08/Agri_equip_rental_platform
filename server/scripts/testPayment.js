const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('--- Starting Phase 5 Payments Automated Tests ---');

  const timestamp = Date.now();
  const ownerCreds = {
    name: 'Payment Test Owner',
    email: `pay_owner_${timestamp}@test.com`,
    password: 'Password123!',
    role: 'owner',
    phone: '9876543230',
  };

  const renterCreds = {
    name: 'Payment Test Renter',
    email: `pay_renter_${timestamp}@test.com`,
    password: 'Password123!',
    role: 'renter',
    phone: '9876543231',
  };

  let ownerToken, renterToken;
  let equipmentId, bookingId;

  try {
    // 1. Register users
    console.log('1. Registering test owner and renter...');
    const ownerRes = await request('/auth/register', { method: 'POST', body: ownerCreds });
    if (!ownerRes.ok) throw new Error(`Owner register failed: ${JSON.stringify(ownerRes.data)}`);
    ownerToken = ownerRes.data.token;

    const renterRes = await request('/auth/register', { method: 'POST', body: renterCreds });
    if (!renterRes.ok) throw new Error(`Renter register failed: ${JSON.stringify(renterRes.data)}`);
    renterToken = renterRes.data.token;
    console.log('✓ Users registered successfully.');

    // 2. Owner creates equipment
    console.log('2. Owner creating equipment...');
    const equipRes = await request('/equipment', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: {
        name: `Harvester Test ${timestamp}`,
        type: 'harvester',
        description: 'Payment testing harvester',
        pricePerDay: 2000,
        locationName: 'Test Zone, Haryana',
        latitude: '29.5',
        longitude: '76.5',
      },
    });
    if (!equipRes.ok) throw new Error(`Equipment creation failed: ${JSON.stringify(equipRes.data)}`);
    equipmentId = equipRes.data.data._id;

    // Connect to mongoose to approve equipment for testing
    await mongoose.connect(process.env.MONGO_URI);
    const Equipment = require('../models/Equipment');
    const Booking = require('../models/Booking');
    const User = require('../models/User');

    await Equipment.findByIdAndUpdate(equipmentId, { status: 'approved', isAvailable: true });
    console.log('✓ Equipment approved for booking.');

    // 3. Renter creates booking
    console.log('3. Renter creating booking...');
    const bookRes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renterToken}` },
      body: {
        equipmentId,
        startDate: '2026-11-01T00:00:00.000Z',
        endDate: '2026-11-03T00:00:00.000Z', // 3 days = 6000
      },
    });
    if (!bookRes.ok) throw new Error(`Booking creation failed: ${JSON.stringify(bookRes.data)}`);
    bookingId = bookRes.data.data._id;
    if (bookRes.data.data.status !== 'pending') {
      throw new Error(`Expected status 'pending', got ${bookRes.data.data.status}`);
    }
    console.log(`✓ Booking created with status 'pending' (total: ₹${bookRes.data.data.totalPrice}).`);

    // 4. Owner confirms booking -> Status should become 'awaiting_payment'
    console.log('4. Owner confirming booking...');
    const confirmRes = await request(`/bookings/${bookingId}/confirm`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    if (!confirmRes.ok) throw new Error(`Confirm failed: ${JSON.stringify(confirmRes.data)}`);
    if (confirmRes.data.data.status !== 'awaiting_payment') {
      throw new Error(`Expected status 'awaiting_payment', got ${confirmRes.data.data.status}`);
    }
    console.log(`✓ Booking status transitioned to 'awaiting_payment': "${confirmRes.data.message}"`);

    // 5. Test Signature Verification with Invalid Signature -> Expect 400
    console.log('5. Testing payment verification with invalid signature...');
    const testOrderId = 'order_test_123456';
    const testPaymentId = 'pay_test_789012';
    const invalidSigRes = await request('/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renterToken}` },
      body: {
        bookingId,
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: 'invalid_fraudulent_signature_hex',
      },
    });
    if (invalidSigRes.status !== 400) {
      throw new Error(`Expected 400 for invalid signature, got ${invalidSigRes.status}: ${JSON.stringify(invalidSigRes.data)}`);
    }
    console.log(`✓ Invalid signature correctly rejected with 400: "${invalidSigRes.data.message}"`);

    // 6. Test Signature Verification with Authentic HMAC SHA256 Signature -> Expect 200
    console.log('6. Testing payment verification with authentic HMAC SHA256 signature...');
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    const validSigRes = await request('/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renterToken}` },
      body: {
        bookingId,
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
      },
    });

    if (!validSigRes.ok) {
      throw new Error(`Valid signature verification failed: ${JSON.stringify(validSigRes.data)}`);
    }
    const updatedBooking = validSigRes.data.data;
    if (updatedBooking.status !== 'confirmed') {
      throw new Error(`Expected status 'confirmed', got ${updatedBooking.status}`);
    }
    if (updatedBooking.paymentStatus !== 'paid') {
      throw new Error(`Expected paymentStatus 'paid', got ${updatedBooking.paymentStatus}`);
    }
    if (updatedBooking.razorpayPaymentId !== testPaymentId) {
      throw new Error(`Expected paymentId ${testPaymentId}, got ${updatedBooking.razorpayPaymentId}`);
    }
    console.log(`✓ Payment verified! Status is 'confirmed', paymentStatus is 'paid', paymentId stored.`);

    // 7. Clean up test data
    console.log('7. Cleaning up test data...');
    await Booking.deleteMany({ equipmentId });
    await Equipment.findByIdAndDelete(equipmentId);
    await User.deleteMany({
      email: { $in: [ownerCreds.email, renterCreds.email] },
    });
    await mongoose.disconnect();
    console.log('✓ Test data cleaned up safely.');

    console.log('\n========================================');
    console.log('ALL PHASE 5 PAYMENTS TESTS PASSED (100%)');
    console.log('========================================\n');
  } catch (err) {
    console.error('Payment test execution failed:', err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

runTests();
