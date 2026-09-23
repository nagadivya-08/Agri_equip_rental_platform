/**
 * AgriRent Platform - MongoDB Atlas Sample Data Seed Script
 * 
 * Populates the database with realistic sample agricultural data:
 * - 3 Equipment Owners (Andhra Pradesh - Guntur, Vijayawada, Tenali)
 * - 4 Equipment Renters / Farmers
 * - 1 Verified Admin Account (preserves existing admin if present)
 * - 6 Approved Equipment Listings with geospatial coordinates & Unsplash photos
 * - 5 Bookings (3 Completed, 1 Confirmed & Paid, 1 Pending)
 * - 6 Mutual Reviews (Renter <-> Owner) with realistic ratings & natural feedback
 * 
 * Safety & Idempotency:
 * - Uses a dedicated "@agrirent-demo.com" email domain for sample accounts.
 * - Safely detects and cleans up ONLY prior sample data on repeat runs.
 * - NEVER touches or deletes real test accounts or existing admins.
 * 
 * Usage:
 *   node scripts/seedData.js
 *   (or from project root: node server/scripts/seedData.js)
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// 1. Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Domain marker for sample users to ensure 100% safe cleanup without touching real test users
const SAMPLE_DOMAIN = '@agrirent-demo.com';

const SAMPLE_OWNERS = [
  {
    name: 'Venkat Rao Chebrolu',
    email: 'venkat.rao@agrirent-demo.com',
    password: 'DemoOwner@123',
    phone: '9848012345',
    role: 'owner',
    location: 'Chebrolu, Guntur District, Andhra Pradesh',
    verified: true,
  },
  {
    name: 'Srinivasa Reddy K',
    email: 'srinivas.reddy@agrirent-demo.com',
    password: 'DemoOwner@123',
    phone: '9440123456',
    role: 'owner',
    location: 'Kankipadu, Vijayawada Rural, Andhra Pradesh',
    verified: true,
  },
  {
    name: 'Ramesh Varma Penumatsa',
    email: 'ramesh.varma@agrirent-demo.com',
    password: 'DemoOwner@123',
    phone: '9866234567',
    role: 'owner',
    location: 'Angalakuduru, Tenali, Andhra Pradesh',
    verified: true,
  },
];

const SAMPLE_RENTERS = [
  {
    name: 'Anji Naidu Polisetty',
    email: 'anji.naidu@agrirent-demo.com',
    password: 'DemoRenter@123',
    phone: '9989056789',
    role: 'renter',
    location: 'Tadikonda, Guntur District, Andhra Pradesh',
    verified: true,
  },
  {
    name: 'Krishna Murthy V',
    email: 'krishna.murthy@agrirent-demo.com',
    password: 'DemoRenter@123',
    phone: '9701234590',
    role: 'renter',
    location: 'Gannavaram, Krishna District, Andhra Pradesh',
    verified: true,
  },
  {
    name: 'Lakshmi Devi Ch',
    email: 'lakshmi.devi@agrirent-demo.com',
    password: 'DemoRenter@123',
    phone: '9490345678',
    role: 'renter',
    location: 'Duggirala, Guntur District, Andhra Pradesh',
    verified: true,
  },
  {
    name: 'Suresh Babu M',
    email: 'suresh.babu@agrirent-demo.com',
    password: 'DemoRenter@123',
    phone: '9618098765',
    role: 'renter',
    location: 'Mangalagiri, Guntur District, Andhra Pradesh',
    verified: true,
  },
];

// Helper to calculate rental days between two dates inclusive
const calcDays = (start, end) => {
  const diffMs = new Date(end) - new Date(start);
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
};

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ Error: MONGO_URI or MONGODB_URI not found in server/.env');
    process.exit(1);
  }

  console.log('\n============================================================');
  console.log('🚜 AgriRent Platform - Database Sample Data Seeder');
  console.log('============================================================\n');

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected successfully to database.\n');

    // -------------------------------------------------------------
    // Step 1: Idempotency Check & Safe Cleanup of Previous Sample Data
    // -------------------------------------------------------------
    const sampleUserEmails = [
      ...SAMPLE_OWNERS.map((u) => u.email),
      ...SAMPLE_RENTERS.map((u) => u.email),
    ];

    const existingSampleUsers = await User.find({
      $or: [
        { email: { $in: sampleUserEmails } },
        { email: { $regex: `@agrirent-demo\\.com$`, $options: 'i' } },
      ],
    });

    if (existingSampleUsers.length > 0) {
      const sampleUserIds = existingSampleUsers.map((u) => u._id);

      // Find equipment owned by sample owners
      const existingSampleEquipment = await Equipment.find({
        ownerId: { $in: sampleUserIds },
      });
      const sampleEquipmentIds = existingSampleEquipment.map((e) => e._id);

      // Delete sample reviews
      const deletedReviews = await Review.deleteMany({
        $or: [
          { reviewerId: { $in: sampleUserIds } },
          { revieweeId: { $in: sampleUserIds } },
          { equipmentId: { $in: sampleEquipmentIds } },
        ],
      });

      // Delete sample bookings
      const deletedBookings = await Booking.deleteMany({
        $or: [
          { renterId: { $in: sampleUserIds } },
          { ownerId: { $in: sampleUserIds } },
          { equipmentId: { $in: sampleEquipmentIds } },
        ],
      });

      // Delete sample equipment
      const deletedEquipment = await Equipment.deleteMany({
        ownerId: { $in: sampleUserIds },
      });

      // Delete sample users
      const deletedUsers = await User.deleteMany({
        _id: { $in: sampleUserIds },
      });

      console.log(`🧹 Safe Idempotent Cleanup:`);
      console.log(`   Removed ${deletedUsers.deletedCount} existing sample user(s)`);
      console.log(`   Removed ${deletedEquipment.deletedCount} existing sample equipment listing(s)`);
      console.log(`   Removed ${deletedBookings.deletedCount} existing sample booking(s)`);
      console.log(`   Removed ${deletedReviews.deletedCount} existing sample review(s)`);
      console.log(`   🛡️ Real test users & admin accounts were untouched!\n`);
    } else {
      console.log('ℹ️  No previous sample data found. Proceeding with fresh seed...\n');
    }

    // -------------------------------------------------------------
    // Step 2: Ensure Admin Account Exists (Item 4)
    // -------------------------------------------------------------
    let adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log(`🛡️  Admin Account: Preserving existing admin "${adminUser.email}" (${adminUser.name})`);
    } else {
      adminUser = await User.create({
        name: 'Platform Administrator',
        email: 'admin@agrirent.com',
        password: 'AdminPass123!',
        phone: '9876543210',
        role: 'admin',
        location: 'Vijayawada, Andhra Pradesh',
        verified: true,
      });
      console.log(`🛡️  Admin Account: Created new admin user "admin@agrirent.com"`);
    }

    // -------------------------------------------------------------
    // Step 3: Create 3 Sample Owners (Item 2)
    // -------------------------------------------------------------
    console.log('\n👤 Creating 3 Equipment Owners (Andhra Pradesh)...');
    const createdOwners = [];
    for (const ownerData of SAMPLE_OWNERS) {
      const owner = await User.create(ownerData);
      createdOwners.push(owner);
      console.log(`   ✓ Owner: ${owner.name} (${owner.location}) - ${owner.email}`);
    }

    // -------------------------------------------------------------
    // Step 4: Create 4 Sample Renters (Item 3)
    // -------------------------------------------------------------
    console.log('\n🌾 Creating 4 Farmers / Renters (Andhra Pradesh)...');
    const createdRenters = [];
    for (const renterData of SAMPLE_RENTERS) {
      const renter = await User.create(renterData);
      createdRenters.push(renter);
      console.log(`   ✓ Renter: ${renter.name} (${renter.location}) - ${renter.email}`);
    }

    // -------------------------------------------------------------
    // Step 5: Create 6 Equipment Listings (Item 5)
    // -------------------------------------------------------------
    console.log('\n🚜 Creating 6 Approved Agricultural Equipment Listings...');
    const sampleEquipmentData = [
      // Owner 0 (Venkat Rao - Chebrolu, Guntur)
      {
        ownerId: createdOwners[0]._id,
        name: 'Mahindra 575 DI 45HP Tractor',
        type: 'tractor',
        description: 'Heavy-duty 45 HP 4-cylinder tractor with power steering and optional rotavator. Ideal for wet paddy tilling and heavy field haulage.',
        images: [
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
        ],
        pricePerDay: 1800,
        location: { type: 'Point', coordinates: [80.4365, 16.3067] }, // [lng, lat] Chebrolu/Guntur
        locationName: 'Chebrolu, Guntur District, Andhra Pradesh',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: createdOwners[0]._id,
        name: 'VST Shakti 130DI Power Tiller',
        type: 'tiller',
        description: '13 HP multi-speed rotary tiller. Compact, nimble, and fuel-efficient for nursery bed preparation, turmeric, and vegetable farming.',
        images: [
          'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
        ],
        pricePerDay: 750,
        location: { type: 'Point', coordinates: [80.4600, 16.2800] },
        locationName: 'Guntur Rural, Andhra Pradesh',
        status: 'approved',
        isAvailable: true,
      },

      // Owner 1 (Srinivasa Reddy - Kankipadu, Vijayawada)
      {
        ownerId: createdOwners[1]._id,
        name: 'Preet 987 Self-Propelled Combine Harvester',
        type: 'harvester',
        description: 'Heavy-duty automated multi-crop combine harvester with 14-foot cutter bar. High-output harvesting for paddy, wheat, and pulses with minimal grain loss.',
        images: [
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
        ],
        pricePerDay: 2800,
        location: { type: 'Point', coordinates: [80.7680, 16.4380] }, // Kankipadu/Vijayawada
        locationName: 'Kankipadu, Vijayawada Rural, Andhra Pradesh',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: createdOwners[1]._id,
        name: 'ASPEE HTP Tractor-Mounted Boom Sprayer',
        type: 'sprayer',
        description: '500-liter chemical tank with 24-nozzle adjustable hydraulic boom. Uniform mist coverage of 10-12 acres/hour for cotton and chilli crops.',
        images: [
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
        ],
        pricePerDay: 950,
        location: { type: 'Point', coordinates: [80.6480, 16.5062] }, // Vijayawada
        locationName: 'Vijayawada, Krishna District, Andhra Pradesh',
        status: 'approved',
        isAvailable: true,
      },

      // Owner 2 (Ramesh Varma - Tenali)
      {
        ownerId: createdOwners[2]._id,
        name: 'IoTech World AGRIBOT 16L Agriculture Drone',
        type: 'drone',
        description: 'DGCA Type-certified precision agricultural spray drone with radar terrain following, automated obstacle avoidance, and high-efficiency micro-droplets.',
        images: [
          'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
        ],
        pricePerDay: 2200,
        location: { type: 'Point', coordinates: [80.6450, 16.2430] }, // Tenali
        locationName: 'Tenali, Guntur District, Andhra Pradesh',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: createdOwners[2]._id,
        name: 'John Deere 5050D 4WD Utility Tractor',
        type: 'tractor',
        description: '50 HP 4WD tractor equipped with heavy-duty MB plough and hydraulic trolley. Outstanding pull and fuel efficiency in black cotton soil.',
        images: [
          'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
        ],
        pricePerDay: 2400,
        location: { type: 'Point', coordinates: [80.6100, 16.2200] },
        locationName: 'Angalakuduru, Tenali, Andhra Pradesh',
        status: 'approved',
        isAvailable: true,
      },
    ];

    const createdEquipment = [];
    for (const eqData of sampleEquipmentData) {
      const equipment = await Equipment.create(eqData);
      createdEquipment.push(equipment);
      console.log(`   ✓ [${equipment.type.toUpperCase()}] ${equipment.name} - ₹${equipment.pricePerDay}/day (${equipment.locationName})`);
    }

    // -------------------------------------------------------------
    // Step 6: Create 5 Sample Bookings (Item 6)
    // -------------------------------------------------------------
    console.log('\n📅 Creating 5 Sample Bookings (3 Completed, 1 Confirmed, 1 Pending)...');

    const now = new Date();
    // Helper to get offset date
    const getDateOffset = (daysAgo) => {
      const d = new Date(now);
      d.setDate(d.getDate() + daysAgo);
      return d;
    };

    // Booking 1: Completed (25 days ago -> 21 days ago = 5 days)
    const b1Start = getDateOffset(-25);
    const b1End = getDateOffset(-21);
    const b1Days = calcDays(b1Start, b1End);
    const b1Total = b1Days * createdEquipment[0].pricePerDay; // Mahindra Tractor (1800 * 5 = 9000)

    // Booking 2: Completed (18 days ago -> 16 days ago = 3 days)
    const b2Start = getDateOffset(-18);
    const b2End = getDateOffset(-16);
    const b2Days = calcDays(b2Start, b2End);
    const b2Total = b2Days * createdEquipment[2].pricePerDay; // Preet Harvester (2800 * 3 = 8400)

    // Booking 3: Completed (12 days ago -> 11 days ago = 2 days)
    const b3Start = getDateOffset(-12);
    const b3End = getDateOffset(-11);
    const b3Days = calcDays(b3Start, b3End);
    const b3Total = b3Days * createdEquipment[4].pricePerDay; // Agri Drone (2200 * 2 = 4400)

    // Booking 4: Confirmed (5 days in future -> 7 days in future = 3 days, paid)
    const b4Start = getDateOffset(5);
    const b4End = getDateOffset(7);
    const b4Days = calcDays(b4Start, b4End);
    const b4Total = b4Days * createdEquipment[5].pricePerDay; // John Deere Tractor (2400 * 3 = 7200)

    // Booking 5: Pending (10 days in future -> 12 days in future = 3 days, unpaid)
    const b5Start = getDateOffset(10);
    const b5End = getDateOffset(12);
    const b5Days = calcDays(b5Start, b5End);
    const b5Total = b5Days * createdEquipment[1].pricePerDay; // Power Tiller (750 * 3 = 2250)

    const sampleBookingsData = [
      {
        equipmentId: createdEquipment[0]._id,
        renterId: createdRenters[0]._id, // Anji Naidu
        ownerId: createdOwners[0]._id,   // Venkat Rao
        startDate: b1Start,
        endDate: b1End,
        totalPrice: b1Total,
        status: 'completed',
        paymentStatus: 'paid',
        razorpayOrderId: 'order_seed_001_mock',
        razorpayPaymentId: 'pay_seed_001_mock',
      },
      {
        equipmentId: createdEquipment[2]._id,
        renterId: createdRenters[1]._id, // Krishna Murthy
        ownerId: createdOwners[1]._id,   // Srinivasa Reddy
        startDate: b2Start,
        endDate: b2End,
        totalPrice: b2Total,
        status: 'completed',
        paymentStatus: 'paid',
        razorpayOrderId: 'order_seed_002_mock',
        razorpayPaymentId: 'pay_seed_002_mock',
      },
      {
        equipmentId: createdEquipment[4]._id,
        renterId: createdRenters[2]._id, // Lakshmi Devi
        ownerId: createdOwners[2]._id,   // Ramesh Varma
        startDate: b3Start,
        endDate: b3End,
        totalPrice: b3Total,
        status: 'completed',
        paymentStatus: 'paid',
        razorpayOrderId: 'order_seed_003_mock',
        razorpayPaymentId: 'pay_seed_003_mock',
      },
      {
        equipmentId: createdEquipment[5]._id,
        renterId: createdRenters[0]._id, // Anji Naidu
        ownerId: createdOwners[2]._id,   // Ramesh Varma
        startDate: b4Start,
        endDate: b4End,
        totalPrice: b4Total,
        status: 'confirmed',
        paymentStatus: 'paid',
        razorpayOrderId: 'order_seed_004_mock',
        razorpayPaymentId: 'pay_seed_004_mock',
      },
      {
        equipmentId: createdEquipment[1]._id,
        renterId: createdRenters[3]._id, // Suresh Babu
        ownerId: createdOwners[0]._id,   // Venkat Rao
        startDate: b5Start,
        endDate: b5End,
        totalPrice: b5Total,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    ];

    const createdBookings = [];
    for (const bData of sampleBookingsData) {
      const booking = await Booking.create(bData);
      createdBookings.push(booking);
      console.log(`   ✓ Booking: ${booking.status.toUpperCase()} | Total: ₹${booking.totalPrice} | Paid: ${booking.paymentStatus}`);
    }

    // -------------------------------------------------------------
    // Step 7: Create 6 Reviews (Item 7)
    // -------------------------------------------------------------
    console.log('\n⭐ Creating 6 Reviews for the 3 Completed Bookings...');

    const sampleReviewsData = [
      // Booking 1 - Completed (Mahindra Tractor: Renter Anji Naidu <-> Owner Venkat Rao)
      {
        bookingId: createdBookings[0]._id,
        reviewerId: createdRenters[0]._id,
        revieweeId: createdOwners[0]._id,
        equipmentId: createdEquipment[0]._id,
        rating: 5,
        comment: 'Tractor was in pristine condition and delivered right to our field on time. Very fuel-efficient for ploughing our 8 acres of paddy.',
      },
      {
        bookingId: createdBookings[0]._id,
        reviewerId: createdOwners[0]._id,
        revieweeId: createdRenters[0]._id,
        equipmentId: createdEquipment[0]._id,
        rating: 5,
        comment: 'Anji Naidu handled the machinery with great care and returned it cleanly with full fuel. A courteous and reliable farmer!',
      },

      // Booking 2 - Completed (Combine Harvester: Renter Krishna Murthy <-> Owner Srinivasa Reddy)
      {
        bookingId: createdBookings[1]._id,
        reviewerId: createdRenters[1]._id,
        revieweeId: createdOwners[1]._id,
        equipmentId: createdEquipment[2]._id,
        rating: 5,
        comment: 'Superb harvest speed! We wrapped up our 14 acres in just 3 days before the monsoon rain. Srinivasa garu provided clear operating guidelines.',
      },
      {
        bookingId: createdBookings[1]._id,
        reviewerId: createdOwners[1]._id,
        revieweeId: createdRenters[1]._id,
        equipmentId: createdEquipment[2]._id,
        rating: 4,
        comment: 'Prompt communication throughout the rental window. Payment was completed quickly on the portal. Would happily rent to Krishna again.',
      },

      // Booking 3 - Completed (Agri Drone: Renter Lakshmi Devi <-> Owner Ramesh Varma)
      {
        bookingId: createdBookings[2]._id,
        reviewerId: createdRenters[2]._id,
        revieweeId: createdOwners[2]._id,
        equipmentId: createdEquipment[4]._id,
        rating: 3,
        comment: 'The drone spraying quality was good and covered the crop evenly. However, the pilot arrived nearly 2 hours late due to battery charging delays.',
      },
      {
        bookingId: createdBookings[2]._id,
        reviewerId: createdOwners[2]._id,
        revieweeId: createdRenters[2]._id,
        equipmentId: createdEquipment[4]._id,
        rating: 5,
        comment: 'Lakshmi Devi had water and field points ready ahead of time. Apologies once again for the battery delay; glad the crop spray worked out well.',
      },
    ];

    const createdReviews = [];
    for (const rData of sampleReviewsData) {
      const review = await Review.create(rData);
      createdReviews.push(review);
      console.log(`   ✓ Review: ${review.rating}★ - "${review.comment.substring(0, 55)}..."`);
    }

    // -------------------------------------------------------------
    // Step 8: Console Summary & Sample Credentials (Item 9)
    // -------------------------------------------------------------
    console.log('\n============================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('============================================================');
    console.log(`📊 Summary of Created Sample Records:`);
    console.log(`   • Owners Created:    ${createdOwners.length}`);
    console.log(`   • Renters Created:   ${createdRenters.length}`);
    console.log(`   • Admin Account:     ${adminUser.email} (Preserved / Verified)`);
    console.log(`   • Equipment Listed:  ${createdEquipment.length} (100% Approved)`);
    console.log(`   • Bookings Created:  ${createdBookings.length} (3 Completed, 1 Confirmed, 1 Pending)`);
    console.log(`   • Reviews Created:   ${createdReviews.length} (Mutual Renter & Owner feedback)`);
    console.log('------------------------------------------------------------');
    console.log('🔑 SAMPLE LOGIN CREDENTIALS (for testing & demo):');
    console.log('------------------------------------------------------------');
    console.log('👨‍🌾 EQUIPMENT OWNERS:');
    console.log('   1. Email:    venkat.rao@agrirent-demo.com');
    console.log('      Password: DemoOwner@123');
    console.log('      Role:     Owner (Guntur - Mahindra Tractor & Power Tiller)');
    console.log('');
    console.log('   2. Email:    srinivas.reddy@agrirent-demo.com');
    console.log('      Password: DemoOwner@123');
    console.log('      Role:     Owner (Vijayawada - Harvester & Boom Sprayer)');
    console.log('------------------------------------------------------------');
    console.log('🚜 FARMERS / RENTERS:');
    console.log('   1. Email:    anji.naidu@agrirent-demo.com');
    console.log('      Password: DemoRenter@123');
    console.log('      Role:     Renter (Has 1 Completed & 1 Confirmed Booking)');
    console.log('');
    console.log('   2. Email:    lakshmi.devi@agrirent-demo.com');
    console.log('      Password: DemoRenter@123');
    console.log('      Role:     Renter (Has 1 Completed Drone Spray Booking)');
    console.log('------------------------------------------------------------');
    console.log('🛡️  ADMIN ACCOUNT:');
    console.log(`   Email:       ${adminUser.email}`);
    console.log('   Password:    (Existing admin password or AdminPass123! if newly created)');
    console.log('============================================================\n');

  } catch (err) {
    console.error('\n❌ Seeding failed with error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.\n');
  }
};

// Execute
seedDatabase();
