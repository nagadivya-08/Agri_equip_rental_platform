const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api/auth';

const runTests = async () => {
  const timestamp = Date.now();
  const renterEmail = `renter_${timestamp}@test.com`;
  const ownerEmail = `owner_${timestamp}@test.com`;
  const password = 'Password123!';

  console.log('--- STARTING BACKEND AUTH TESTS ---');

  try {
    // 1. Register Renter
    console.log('\n[1] Testing Register Renter...');
    const regRenterRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Renter',
        email: renterEmail,
        password,
        phone: '1234567890',
        role: 'renter',
      }),
    });
    const regRenterData = await regRenterRes.json();
    if (!regRenterRes.ok) throw new Error(JSON.stringify(regRenterData));
    console.log('✅ Renter registered successfully. Status:', regRenterRes.status);
    console.log('User role:', regRenterData.user.role);
    console.log('Token received:', !!regRenterData.token);
    console.log('Password excluded:', regRenterData.user.password === undefined);
    const renterToken = regRenterData.token;

    // 2. Register Owner
    console.log('\n[2] Testing Register Owner...');
    const regOwnerRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Owner',
        email: ownerEmail,
        password,
        phone: '9876543210',
        role: 'owner',
      }),
    });
    const regOwnerData = await regOwnerRes.json();
    if (!regOwnerRes.ok) throw new Error(JSON.stringify(regOwnerData));
    console.log('✅ Owner registered successfully. Status:', regOwnerRes.status);
    console.log('User role:', regOwnerData.user.role);

    // 3. Duplicate Email Error
    console.log('\n[3] Testing Duplicate Email registration...');
    const dupRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate User',
        email: renterEmail,
        password: 'SomePassword',
      }),
    });
    const dupData = await dupRes.json();
    if (dupRes.status === 400) {
      console.log('✅ Duplicate registration correctly returned 400:', dupData.message);
    } else {
      throw new Error(`Expected status 400 but got ${dupRes.status}`);
    }

    // 4. Invalid Login
    console.log('\n[4] Testing Login with invalid password...');
    const invLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: renterEmail,
        password: 'WrongPassword!',
      }),
    });
    const invLoginData = await invLoginRes.json();
    if (invLoginRes.status === 401) {
      console.log('✅ Invalid login correctly returned 401:', invLoginData.message);
    } else {
      throw new Error(`Expected status 401 but got ${invLoginRes.status}`);
    }

    // 5. Valid Login
    console.log('\n[5] Testing Valid Login...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: renterEmail,
        password,
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    console.log('✅ Login successful. Status:', loginRes.status);
    console.log('Logged in user:', loginData.user.name, `(${loginData.user.role})`);

    // 6. GET /me (Protected)
    console.log('\n[6] Testing GET /api/auth/me...');
    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${renterToken}` },
    });
    const meData = await meRes.json();
    if (!meRes.ok) throw new Error(JSON.stringify(meData));
    console.log('✅ /me returned current user profile:', meData.user.name, `(${meData.user.email})`);

    // 7. GET /admin-test with Renter Token (Should return 403)
    console.log('\n[7] Testing GET /api/auth/admin-test with Renter token (Expect 403)...');
    const adminForbiddenRes = await fetch(`${BASE_URL}/admin-test`, {
      headers: { Authorization: `Bearer ${renterToken}` },
    });
    const adminForbiddenData = await adminForbiddenRes.json();
    if (adminForbiddenRes.status === 403) {
      console.log('✅ Renter correctly denied 403 Forbidden:', adminForbiddenData.message);
    } else {
      throw new Error(`Expected status 403 but got ${adminForbiddenRes.status}`);
    }

    console.log('\n🎉 ALL BACKEND AUTH TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('Test error:', err.message);
    process.exit(1);
  }
};

runTests();
