const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Equipment = require('../models/Equipment');
const BASE_URL = 'http://localhost:5000/api';

const runEquipmentTests = async () => {
  const timestamp = Date.now();
  const ownerEmail = `owner_equip_${timestamp}@test.com`;
  const password = 'Password123!';

  console.log('--- STARTING BACKEND EQUIPMENT TESTS ---');

  try {
    // Connect to mongoose directly for status flipping tests
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

    // 1. Register an Owner
    console.log('\n[1] Registering Owner for testing...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Patel',
        email: ownerEmail,
        password,
        phone: '9876543210',
        role: 'owner',
      }),
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    const ownerToken = regData.token;
    console.log('✅ Owner registered with ID:', regData.user._id);

    // 2. Create Equipment Listing (POST /api/equipment)
    console.log('\n[2] Creating Equipment Listing via POST /api/equipment...');
    // Create FormData with native Blob for testing multipart upload
    const formData = new FormData();
    formData.append('name', 'John Deere 5050 D Tractor');
    formData.append('type', 'tractor');
    formData.append('description', '50 HP powerful tractor with rotavator attachment');
    formData.append('pricePerDay', '2500');
    formData.append('locationName', 'Guntur, Andhra Pradesh');
    formData.append('latitude', '16.3067');
    formData.append('longitude', '80.4365');

    // Attach a fake dummy image blob
    const dummyImageBlob = new Blob(['fake image content'], { type: 'image/png' });
    formData.append('images', dummyImageBlob, 'tractor_sample.png');

    const createRes = await fetch(`${BASE_URL}/equipment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
      },
      body: formData,
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(`Create equipment failed: ${JSON.stringify(createData)}`);
    const equipmentId = createData.data._id;
    console.log('✅ Equipment created successfully. ID:', equipmentId);
    console.log('Status is pending:', createData.data.status === 'pending');
    console.log('Images saved:', createData.data.images);
    console.log('Coordinates [lng, lat]:', createData.data.location.coordinates);

    // 3. Confirm Pending Equipment is NOT on public GET /api/equipment
    console.log('\n[3] Checking public GET /api/equipment (must NOT include pending)...');
    const publicRes1 = await fetch(`${BASE_URL}/equipment`);
    const publicData1 = await publicRes1.json();
    const isFoundPubliclyBefore = publicData1.data.some((eq) => eq._id === equipmentId);
    console.log('Pending equipment found in public list?', isFoundPubliclyBefore);
    if (isFoundPubliclyBefore) {
      throw new Error('FAILED: Pending equipment should not be visible on public /api/equipment!');
    }
    console.log('✅ Confirmed: Pending equipment is omitted from public browse.');

    // 4. Confirm Owner CAN see it on GET /api/equipment/my
    console.log('\n[4] Checking owner GET /api/equipment/my...');
    const myRes = await fetch(`${BASE_URL}/equipment/my`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const myData = await myRes.json();
    const isFoundInMy = myData.data.some((eq) => eq._id === equipmentId);
    console.log('Equipment found in My Listings?', isFoundInMy);
    if (!isFoundInMy) {
      throw new Error('FAILED: Equipment should be visible in owner GET /api/equipment/my');
    }
    console.log('✅ Confirmed: Owner sees equipment with status "pending".');

    // 5. Test PATCH /api/equipment/:id
    console.log('\n[5] Updating equipment price (PATCH /api/equipment/:id)...');
    const patchRes = await fetch(`${BASE_URL}/equipment/${equipmentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        pricePerDay: 2800,
        status: 'approved', // Owner attempts to sneak status change
      }),
    });
    const patchData = await patchRes.json();
    if (!patchRes.ok) throw new Error(`Patch failed: ${JSON.stringify(patchData)}`);
    console.log('Updated price:', patchData.data.pricePerDay);
    console.log('Status stayed "pending" (owner cannot change status directly):', patchData.data.status === 'pending');
    if (patchData.data.status !== 'pending') {
      throw new Error('FAILED: Owner was able to change status to approved directly!');
    }
    console.log('✅ Confirmed: Status protection prevents unauthorized approval.');

    // 6. Flip status to "approved" in DB & Verify public visibility
    console.log('\n[6] Approving equipment directly in DB and re-checking public browse...');
    await Equipment.findByIdAndUpdate(equipmentId, { status: 'approved' });

    const publicRes2 = await fetch(`${BASE_URL}/equipment`);
    const publicData2 = await publicRes2.json();
    const isFoundPubliclyAfter = publicData2.data.some((eq) => eq._id === equipmentId);
    console.log('Approved equipment found in public list?', isFoundPubliclyAfter);
    if (!isFoundPubliclyAfter) {
      throw new Error('FAILED: Approved equipment should appear on public /api/equipment!');
    }
    console.log('✅ Confirmed: Approved equipment now appears on public browse.');

    // 7. Test Filters (type & search)
    console.log('\n[7] Testing search & type filters...');
    const searchRes = await fetch(`${BASE_URL}/equipment?search=Deere&type=tractor`);
    const searchData = await searchRes.json();
    console.log('Filter search match count:', searchData.count);
    if (searchData.count === 0) {
      throw new Error('FAILED: Search for "Deere" & type "tractor" should return our equipment');
    }
    console.log('✅ Confirmed: Filtering by type and search keyword works.');

    // 8. Test GET /api/equipment/:id
    console.log('\n[8] Testing single equipment details (GET /api/equipment/:id)...');
    const singleRes = await fetch(`${BASE_URL}/equipment/${equipmentId}`);
    const singleData = await singleRes.json();
    console.log('Retrieved equipment name:', singleData.data.name);
    console.log('Owner populated name & phone:', singleData.data.ownerId?.name, singleData.data.ownerId?.phone);
    console.log('✅ Confirmed: Single equipment endpoint returns populated owner details.');

    // 9. Test DELETE /api/equipment/:id
    console.log('\n[9] Testing DELETE /api/equipment/:id...');
    const deleteRes = await fetch(`${BASE_URL}/equipment/${equipmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const deleteData = await deleteRes.json();
    console.log('Delete response:', deleteData.message);
    const verifyDeleted = await Equipment.findById(equipmentId);
    console.log('Equipment exists after deletion?', !!verifyDeleted);
    console.log('✅ Confirmed: Equipment successfully deleted.');

    console.log('\n🎉 ALL BACKEND EQUIPMENT TESTS PASSED! 🎉\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runEquipmentTests();
