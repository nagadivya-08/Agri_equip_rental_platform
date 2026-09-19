const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Equipment = require('../models/Equipment');
const BASE_URL = 'http://localhost:5000/api';

const runAdminTests = async () => {
  console.log('--- STARTING BACKEND ADMIN MODERATION TESTS ---');

  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

    // 1. Ensure Admin exists
    const adminEmail = 'admin@agrirent.com';
    const adminPassword = 'AdminPass123!';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Platform Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        verified: true,
      });
      console.log('Created new test admin account.');
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
    }

    // Login as Admin
    console.log('\n[1] Logging in as Admin...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
    const adminToken = adminLoginData.token;
    console.log('✅ Logged in as Admin. Token obtained.');

    // 2. Register a test Owner and create 2 pending equipment items
    console.log('\n[2] Creating test owner and 2 pending equipment items...');
    const timestamp = Date.now();
    const owner = await User.create({
      name: 'Farmer Joe',
      email: `owner_mod_${timestamp}@test.com`,
      password: 'Password123!',
      phone: '8887776666',
      role: 'owner',
    });

    const item1 = await Equipment.create({
      ownerId: owner._id,
      name: `Pending Harvester ${timestamp}`,
      type: 'harvester',
      pricePerDay: 4500,
      status: 'pending',
    });

    const item2 = await Equipment.create({
      ownerId: owner._id,
      name: `Pending Drone ${timestamp}`,
      type: 'drone',
      pricePerDay: 1800,
      status: 'pending',
    });
    console.log('✅ Created pending items:', item1._id, item2._id);

    // 3. Test GET /api/admin/listings/pending
    console.log('\n[3] Testing GET /api/admin/listings/pending...');
    const pendingRes = await fetch(`${BASE_URL}/admin/listings/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pendingData = await pendingRes.json();
    if (!pendingRes.ok) throw new Error(`Pending fetch failed: ${JSON.stringify(pendingData)}`);
    const found1 = pendingData.data.some((eq) => eq._id.toString() === item1._id.toString());
    const found2 = pendingData.data.some((eq) => eq._id.toString() === item2._id.toString());
    console.log('Both pending items found:', found1 && found2);
    if (!found1 || !found2) throw new Error('FAILED: Pending items missing from admin pending endpoint');
    console.log('✅ Pending listings endpoint returned items with owner info:', pendingData.data[0]?.ownerId?.name);

    // 4. Test PATCH /api/admin/listings/:id/approve
    console.log('\n[4] Testing PATCH /api/admin/listings/:id/approve on item 1...');
    const approveRes = await fetch(`${BASE_URL}/admin/listings/${item1._id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approveData = await approveRes.json();
    if (!approveRes.ok) throw new Error(`Approve failed: ${JSON.stringify(approveData)}`);
    console.log('Item 1 approved status:', approveData.data.status);
    if (approveData.data.status !== 'approved') throw new Error('FAILED: Status was not set to approved');
    console.log('✅ Item successfully approved.');

    // 5. Test PATCH /api/admin/listings/:id/reject with reason
    console.log('\n[5] Testing PATCH /api/admin/listings/:id/reject on item 2 with reason...');
    const rejectRes = await fetch(`${BASE_URL}/admin/listings/${item2._id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Clear photos of equipment blades required.' }),
    });
    const rejectData = await rejectRes.json();
    if (!rejectRes.ok) throw new Error(`Reject failed: ${JSON.stringify(rejectData)}`);
    console.log('Item 2 rejected status:', rejectData.data.status);
    console.log('Rejection reason stored:', rejectData.data.rejectionReason);
    if (rejectData.data.status !== 'rejected' || !rejectData.data.rejectionReason.includes('Clear photos')) {
      throw new Error('FAILED: Status or rejectionReason mismatch');
    }
    console.log('✅ Item successfully rejected with reason stored.');

    // 6. Test GET /api/admin/stats
    console.log('\n[6] Testing GET /api/admin/stats...');
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    if (!statsRes.ok) throw new Error(`Stats failed: ${JSON.stringify(statsData)}`);
    console.log('Stats returned:', statsData.data);
    if (!statsData.data.users || !statsData.data.equipment) throw new Error('FAILED: Stats format invalid');
    console.log('✅ Admin stats successfully returned.');

    // 7. Test User Ban / Unban & Middleware Enforcement
    console.log('\n[7] Testing User Ban and 401 Middleware rejection...');
    const renterEmail = `renter_ban_${timestamp}@test.com`;
    const renterPassword = 'RenterPass123!';
    const renter = await User.create({
      name: 'Bad Actor Renter',
      email: renterEmail,
      password: renterPassword,
      role: 'renter',
    });

    // Login as renter to get active token
    const renterLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: renterEmail, password: renterPassword }),
    });
    const renterData = await renterLogin.json();
    const renterToken = renterData.token;

    // Admin bans renter
    console.log('Admin banning renter...');
    const banRes = await fetch(`${BASE_URL}/admin/users/${renter._id}/ban`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const banData = await banRes.json();
    if (!banRes.ok) throw new Error(`Ban user failed: ${JSON.stringify(banData)}`);
    console.log('Banned status in response:', banData.data.banned);

    // Renter tries to access GET /api/auth/me with existing token
    console.log('Banned renter attempting to access protected route (GET /api/auth/me)...');
    const meResBanned = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${renterToken}` },
    });
    const meDataBanned = await meResBanned.json();
    console.log('Response status:', meResBanned.status, 'Message:', meDataBanned.message);
    if (meResBanned.status !== 401 || !meDataBanned.message.toLowerCase().includes('banned')) {
      throw new Error('FAILED: Expected 401 with banned message');
    }
    console.log('✅ Protect middleware correctly rejected banned user token with 401.');

    // Banned renter tries to login again
    console.log('Banned renter attempting to log in again...');
    const loginBannedRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: renterEmail, password: renterPassword }),
    });
    const loginBannedData = await loginBannedRes.json();
    console.log('Login attempt status:', loginBannedRes.status, 'Message:', loginBannedData.message);
    if (loginBannedRes.status !== 401 || !loginBannedData.message.toLowerCase().includes('banned')) {
      throw new Error('FAILED: Expected login rejection for banned user');
    }
    console.log('✅ Login correctly rejected for banned user.');

    // Admin unbans renter
    console.log('Admin unbanning renter...');
    const unbanRes = await fetch(`${BASE_URL}/admin/users/${renter._id}/unban`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const unbanData = await unbanRes.json();
    if (!unbanRes.ok) throw new Error(`Unban failed: ${JSON.stringify(unbanData)}`);
    console.log('Unbanned status:', unbanData.data.banned);

    // Unbanned renter can access protected route now
    const meResUnbanned = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${renterToken}` },
    });
    if (meResUnbanned.status !== 200) {
      throw new Error(`FAILED: Expected 200 after unban, got ${meResUnbanned.status}`);
    }
    console.log('✅ Unbanned user can access protected route again.');

    // 8. Test Non-Admin Role Restriction on Admin Route
    console.log('\n[8] Confirming non-admin cannot access GET /api/admin/stats...');
    const nonAdminStats = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${renterToken}` },
    });
    console.log('Renter accessing admin stats status:', nonAdminStats.status);
    if (nonAdminStats.status !== 403) throw new Error('FAILED: Non-admin should get 403 Forbidden');
    console.log('✅ Correctly blocked with 403 Forbidden.');

    // Clean up test equipment
    await Equipment.deleteMany({ _id: { $in: [item1._id, item2._id] } });
    await User.deleteMany({ _id: { $in: [owner._id, renter._id] } });

    console.log('\n🎉 ALL ADMIN MODERATION TESTS PASSED! 🎉\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runAdminTests();
