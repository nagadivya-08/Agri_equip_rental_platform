const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
  console.log('--- Starting Phase 4 Booking System Automated Tests ---');

  const timestamp = Date.now();
  const ownerCreds = {
    name: 'Booking Test Owner',
    email: `owner_${timestamp}@test.com`,
    password: 'Password123!',
    role: 'owner',
    phone: '9876543210',
  };

  const renter1Creds = {
    name: 'Booking Test Renter 1',
    email: `renter1_${timestamp}@test.com`,
    password: 'Password123!',
    role: 'renter',
    phone: '9876543211',
  };

  const renter2Creds = {
    name: 'Booking Test Renter 2',
    email: `renter2_${timestamp}@test.com`,
    password: 'Password123!',
    role: 'renter',
    phone: '9876543212',
  };

  let ownerToken, renter1Token, renter2Token;
  let equipmentId, booking1Id, booking2Id;

  try {
    // 1. Register users
    console.log('1. Registering test owner and renters...');
    const ownerRes = await request('/auth/register', { method: 'POST', body: ownerCreds });
    if (!ownerRes.ok) throw new Error(`Owner register failed: ${JSON.stringify(ownerRes.data)}`);
    ownerToken = ownerRes.data.token;

    const renter1Res = await request('/auth/register', { method: 'POST', body: renter1Creds });
    if (!renter1Res.ok) throw new Error(`Renter 1 register failed: ${JSON.stringify(renter1Res.data)}`);
    renter1Token = renter1Res.data.token;

    const renter2Res = await request('/auth/register', { method: 'POST', body: renter2Creds });
    if (!renter2Res.ok) throw new Error(`Renter 2 register failed: ${JSON.stringify(renter2Res.data)}`);
    renter2Token = renter2Res.data.token;
    console.log('✓ Users registered successfully.');

    // 2. Owner creates equipment
    console.log('2. Owner creating equipment...');
    const equipRes = await request('/equipment', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: {
        name: `Tractor Test ${timestamp}`,
        type: 'tractor',
        description: 'Heavy duty tractor for testing bookings',
        pricePerDay: 1500,
        locationName: 'Test Field, Punjab',
        latitude: '30.5',
        longitude: '75.5',
      },
    });
    if (!equipRes.ok) throw new Error(`Equip creation failed: ${JSON.stringify(equipRes.data)}`);
    equipmentId = equipRes.data.data._id;
    console.log(`✓ Equipment created with ID: ${equipmentId}`);

    // Connect to mongoose directly to approve equipment for testing
    await mongoose.connect(process.env.MONGO_URI);
    const Equipment = require('../models/Equipment');
    const Booking = require('../models/Booking');
    const User = require('../models/User');

    await Equipment.findByIdAndUpdate(equipmentId, { status: 'approved', isAvailable: true });
    console.log('✓ Equipment approved for booking testing.');

    // 3. Test GET /api/equipment/:id/availability (should be empty initially)
    console.log('3. Checking initial equipment availability...');
    const availRes1 = await request(`/equipment/${equipmentId}/availability`);
    if (availRes1.data.data.length !== 0) {
      throw new Error(`Expected 0 confirmed bookings initially, got ${availRes1.data.data.length}`);
    }
    console.log('✓ Initial confirmed bookings is 0.');

    // 4. Renter 1 creates booking for 2026-10-01 to 2026-10-05 (5 days inclusive)
    console.log('4. Renter 1 creating booking for 2026-10-01 to 2026-10-05...');
    const start1 = '2026-10-01T00:00:00.000Z';
    const end1 = '2026-10-05T00:00:00.000Z';

    const book1Res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renter1Token}` },
      body: {
        equipmentId,
        startDate: start1,
        endDate: end1,
      },
    });

    if (!book1Res.ok) throw new Error(`Booking 1 failed: ${JSON.stringify(book1Res.data)}`);
    booking1Id = book1Res.data.data._id;
    const expectedPrice1 = 1500 * 5; // 7500
    if (book1Res.data.data.totalPrice !== expectedPrice1) {
      throw new Error(`Expected totalPrice ${expectedPrice1}, got ${book1Res.data.data.totalPrice}`);
    }
    if (book1Res.data.data.status !== 'pending') {
      throw new Error(`Expected status 'pending', got ${book1Res.data.data.status}`);
    }
    console.log(`✓ Booking 1 created (pending, totalPrice: ₹${book1Res.data.data.totalPrice}).`);

    // 5. Renter 2 attempts to book overlapping dates: 2026-10-03 to 2026-10-07
    console.log('5. Testing date conflict (Renter 2 overlapping booking)...');
    const overlapRes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renter2Token}` },
      body: {
        equipmentId,
        startDate: '2026-10-03T00:00:00.000Z',
        endDate: '2026-10-07T00:00:00.000Z',
      },
    });

    if (overlapRes.status === 409) {
      console.log(`✓ Overlapping booking correctly rejected with 409 Conflict: "${overlapRes.data.message}"`);
    } else {
      throw new Error(`Expected status 409 Conflict, got ${overlapRes.status}: ${JSON.stringify(overlapRes.data)}`);
    }

    // 6. Renter 2 books non-overlapping dates: 2026-10-10 to 2026-10-12 (3 days inclusive)
    console.log('6. Renter 2 creating non-overlapping booking for 2026-10-10 to 2026-10-12...');
    const book2Res = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renter2Token}` },
      body: {
        equipmentId,
        startDate: '2026-10-10T00:00:00.000Z',
        endDate: '2026-10-12T00:00:00.000Z',
      },
    });

    if (!book2Res.ok) throw new Error(`Booking 2 failed: ${JSON.stringify(book2Res.data)}`);
    booking2Id = book2Res.data.data._id;
    const expectedPrice2 = 1500 * 3; // 4500
    if (book2Res.data.data.totalPrice !== expectedPrice2) {
      throw new Error(`Expected totalPrice ${expectedPrice2}, got ${book2Res.data.data.totalPrice}`);
    }
    console.log(`✓ Booking 2 created successfully (totalPrice: ₹${book2Res.data.data.totalPrice}).`);

    // 7. Test GET /api/bookings/my (Renter 1)
    console.log('7. Fetching renter 1 bookings (/api/bookings/my)...');
    const myBookingsRes = await request('/bookings/my', {
      headers: { Authorization: `Bearer ${renter1Token}` },
    });
    if (myBookingsRes.data.count < 1) {
      throw new Error('Expected at least 1 booking in renter 1 list');
    }
    console.log(`✓ Renter 1 has ${myBookingsRes.data.count} booking(s), populated with: ${myBookingsRes.data.data[0].equipmentId.name}`);

    // 8. Test GET /api/bookings/owner (Owner)
    console.log('8. Fetching owner bookings (/api/bookings/owner)...');
    const ownerBookingsRes = await request('/bookings/owner', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    if (ownerBookingsRes.data.count < 2) {
      throw new Error('Expected at least 2 bookings in owner list');
    }
    console.log(`✓ Owner received ${ownerBookingsRes.data.count} bookings for their equipment.`);

    // 9. Owner confirms Booking 1
    console.log('9. Owner confirming Booking 1...');
    const confirmRes = await request(`/bookings/${booking1Id}/confirm`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    if (!confirmRes.ok || confirmRes.data.data.status !== 'confirmed') {
      throw new Error(`Booking confirm failed: ${JSON.stringify(confirmRes.data)}`);
    }
    console.log(`✓ Booking 1 confirmed: ${confirmRes.data.message}`);

    // 10. Check GET /api/equipment/:id/availability now includes booking 1
    console.log('10. Checking availability endpoint for confirmed bookings...');
    const availRes2 = await request(`/equipment/${equipmentId}/availability`);
    if (availRes2.data.data.length !== 1) {
      throw new Error(`Expected 1 confirmed booking range, got ${availRes2.data.data.length}`);
    }
    console.log(`✓ Availability correctly returns 1 confirmed range: ${availRes2.data.data[0].startDate} to ${availRes2.data.data[0].endDate}`);

    // 11. Test Cancel: Renter 2 cancels Booking 2
    console.log('11. Renter 2 cancelling Booking 2...');
    const cancelRes = await request(`/bookings/${booking2Id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${renter2Token}` },
    });
    if (!cancelRes.ok || cancelRes.data.data.status !== 'cancelled') {
      throw new Error(`Booking cancel failed: ${JSON.stringify(cancelRes.data)}`);
    }
    console.log('✓ Booking 2 cancelled successfully.');

    // Clean up temporary test data
    console.log('12. Cleaning up test data...');
    await Booking.deleteMany({ equipmentId });
    await Equipment.findByIdAndDelete(equipmentId);
    await User.deleteMany({
      email: { $in: [ownerCreds.email, renter1Creds.email, renter2Creds.email] },
    });
    await mongoose.disconnect();
    console.log('✓ Test data cleaned up safely.');

    console.log('\n========================================');
    console.log('ALL PHASE 4 BACKEND TESTS PASSED (100%)');
    console.log('========================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

runTests();
