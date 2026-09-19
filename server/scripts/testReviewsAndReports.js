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
  console.log('--- Starting Phase 6 Reviews & Reporting Automated Tests ---');

  const timestamp = Date.now();
  const ownerCreds = {
    name: 'Review Test Owner',
    email: `rev_owner_${timestamp}@test.com`,
    password: 'Password123!',
    role: 'owner',
    phone: '9876543240',
  };

  const renterCreds = {
    name: 'Review Test Renter',
    email: `rev_renter_${timestamp}@test.com`,
    password: 'Password123!',
    role: 'renter',
    phone: '9876543241',
  };

  const adminCreds = {
    email: 'admin@agrirent.com',
    password: 'AdminPass123!',
  };

  let ownerToken, renterToken, adminToken;
  let equipmentId, bookingId, reportId;

  try {
    // 1. Register test owner and renter
    console.log('1. Registering test owner, renter & logging in admin...');
    const ownerRes = await request('/auth/register', { method: 'POST', body: ownerCreds });
    if (!ownerRes.ok) throw new Error(`Owner register failed: ${JSON.stringify(ownerRes.data)}`);
    ownerToken = ownerRes.data.token;

    const renterRes = await request('/auth/register', { method: 'POST', body: renterCreds });
    if (!renterRes.ok) throw new Error(`Renter register failed: ${JSON.stringify(renterRes.data)}`);
    renterToken = renterRes.data.token;

    const adminRes = await request('/auth/login', { method: 'POST', body: adminCreds });
    if (!adminRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminRes.data)}`);
    adminToken = adminRes.data.token;
    console.log('✓ Users authenticated.');

    // 2. Owner creates equipment
    console.log('2. Owner creating equipment...');
    const equipRes = await request('/equipment', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: {
        name: `Sprayer Trust ${timestamp}`,
        type: 'sprayer',
        description: 'Trust testing sprayer',
        pricePerDay: 1200,
        locationName: 'Test Farm, Gujarat',
        latitude: '23.0',
        longitude: '72.5',
      },
    });
    if (!equipRes.ok) throw new Error(`Equipment creation failed: ${JSON.stringify(equipRes.data)}`);
    equipmentId = equipRes.data.data._id;

    // Connect to DB to approve equipment and set up a completed booking
    await mongoose.connect(process.env.MONGO_URI);
    const Equipment = require('../models/Equipment');
    const Booking = require('../models/Booking');
    const Review = require('../models/Review');
    const Report = require('../models/Report');
    const User = require('../models/User');

    await Equipment.findByIdAndUpdate(equipmentId, { status: 'approved', isAvailable: true });

    // Create a completed booking for renter & owner
    const pastStart = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const booking = await Booking.create({
      equipmentId,
      renterId: renterRes.data.user._id,
      ownerId: ownerRes.data.user._id,
      startDate: pastStart,
      endDate: pastEnd,
      totalPrice: 4800,
      status: 'completed',
      paymentStatus: 'paid',
    });
    bookingId = booking._id;
    console.log(`✓ Completed booking created with ID: ${bookingId}`);

    // 3. Renter leaves a 5-star review
    console.log('3. Renter submitting 5-star review...');
    const renterRevRes = await request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renterToken}` },
      body: {
        bookingId,
        rating: 5,
        comment: 'Excellent machine, worked smoothly without issues!',
      },
    });
    if (!renterRevRes.ok) throw new Error(`Renter review failed: ${JSON.stringify(renterRevRes.data)}`);
    if (renterRevRes.data.data.rating !== 5) {
      throw new Error(`Expected rating 5, got ${renterRevRes.data.data.rating}`);
    }
    console.log('✓ Renter review submitted successfully.');

    // 4. Owner leaves a 4-star review for the same booking
    console.log('4. Owner submitting 4-star review for the renter...');
    const ownerRevRes = await request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: {
        bookingId,
        rating: 4,
        comment: 'Great renter, returned equipment clean and on time.',
      },
    });
    if (!ownerRevRes.ok) throw new Error(`Owner review failed: ${JSON.stringify(ownerRevRes.data)}`);
    if (ownerRevRes.data.data.rating !== 4) {
      throw new Error(`Expected rating 4, got ${ownerRevRes.data.data.rating}`);
    }
    console.log('✓ Owner review submitted successfully.');

    // 5. Renter attempts duplicate review -> Expect 400
    console.log('5. Testing duplicate review prevention...');
    const dupRes = await request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renterToken}` },
      body: {
        bookingId,
        rating: 5,
        comment: 'Trying to review again',
      },
    });
    if (dupRes.status !== 400) {
      throw new Error(`Expected 400 for duplicate review, got ${dupRes.status}`);
    }
    console.log(`✓ Duplicate review correctly rejected: "${dupRes.data.message}"`);

    // 6. Test GET /api/equipment/:id/reviews
    console.log('6. Testing GET /api/equipment/:id/reviews...');
    const equipRevRes = await request(`/equipment/${equipmentId}/reviews`);
    if (!equipRevRes.ok || equipRevRes.data.count < 2) {
      throw new Error(`Expected at least 2 reviews, got: ${JSON.stringify(equipRevRes.data)}`);
    }
    if (equipRevRes.data.averageRating !== 4.5) {
      throw new Error(`Expected averageRating 4.5, got: ${equipRevRes.data.averageRating}`);
    }
    console.log(`✓ Equipment reviews retrieved: count=${equipRevRes.data.count}, avg=${equipRevRes.data.averageRating}`);

    // 7. Test GET /api/equipment (browse list includes averageRating)
    console.log('7. Verifying dynamic averageRating in public browse list...');
    const browseRes = await request('/equipment');
    const targetItem = browseRes.data.data.find((e) => e._id === equipmentId.toString());
    if (!targetItem) throw new Error('Equipment not found in browse list');
    if (targetItem.averageRating !== 4.5 || targetItem.reviewCount !== 2) {
      throw new Error(`Expected averageRating 4.5 and reviewCount 2, got: ${JSON.stringify(targetItem)}`);
    }
    console.log(`✓ Equipment browse item correctly contains averageRating: ${targetItem.averageRating} (${targetItem.reviewCount} reviews).`);

    // 8. Renter submits report on listing
    console.log('8. Renter submitting listing report...');
    const reportRes = await request('/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renterToken}` },
      body: {
        listingId: equipmentId,
        reason: 'Misleading description regarding fuel tank capacity',
      },
    });
    if (!reportRes.ok) throw new Error(`Report submission failed: ${JSON.stringify(reportRes.data)}`);
    reportId = reportRes.data.data._id;
    console.log(`✓ Report created with ID: ${reportId}, status: ${reportRes.data.data.status}`);

    // 9. Admin fetches reports
    console.log('9. Admin fetching open reports...');
    const adminRepRes = await request('/admin/reports', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!adminRepRes.ok || adminRepRes.data.count < 1) {
      throw new Error('Expected at least 1 open report for admin');
    }
    console.log(`✓ Admin retrieved ${adminRepRes.data.count} open report(s).`);

    // 10. Admin resolves report with remove_listing
    console.log('10. Admin resolving report with action: remove_listing...');
    const resolveRes = await request(`/admin/reports/${reportId}/resolve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        action: 'remove_listing',
      },
    });
    if (!resolveRes.ok || resolveRes.data.data.status !== 'reviewed') {
      throw new Error(`Resolve report failed: ${JSON.stringify(resolveRes.data)}`);
    }
    if (!resolveRes.data.listingActionTaken) {
      throw new Error('Expected listingActionTaken to be true');
    }

    // Verify equipment status is now rejected
    const updatedEquip = await Equipment.findById(equipmentId);
    if (updatedEquip.status !== 'rejected') {
      throw new Error(`Expected equipment status 'rejected', got ${updatedEquip.status}`);
    }
    console.log('✓ Report resolved and equipment listing successfully rejected/removed from marketplace.');

    // 11. Clean up test data
    console.log('11. Cleaning up test data...');
    await Review.deleteMany({ equipmentId });
    await Report.deleteMany({ listingId: equipmentId });
    await Booking.deleteMany({ equipmentId });
    await Equipment.findByIdAndDelete(equipmentId);
    await User.deleteMany({
      email: { $in: [ownerCreds.email, renterCreds.email] },
    });
    await mongoose.disconnect();
    console.log('✓ Test data cleaned up safely.');

    console.log('\n======================================================');
    console.log('ALL PHASE 6 REVIEWS & REPORTING TESTS PASSED (100%)');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

runTests();
