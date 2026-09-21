const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Equipment = require('../models/Equipment');

const seedData = async () => {
  try {
    const mongoUri = 'mongodb://127.0.0.1:27017/agrirent';
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);

    let owner = await User.findOne({ role: 'owner' });
    if (!owner) {
      owner = await User.create({
        name: 'Kisan Patel',
        email: 'owner@agrirent.com',
        password: 'Password123!',
        phone: '9876543210',
        role: 'owner',
      });
      console.log('Created owner user:', owner._id);
    } else {
      console.log('Using existing owner user:', owner._id);
    }

    // Clear previous sample equipment to update with photos and ensure clean approved status
    await Equipment.deleteMany({});

    const sampleEquipment = [
      {
        ownerId: owner._id,
        name: 'John Deere 5050D 4WD Tractor',
        type: 'tractor',
        description: '50 HP heavy-duty utility tractor with power steering and dual clutch. Perfect for deep ploughing and hauling.',
        images: ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'],
        pricePerDay: 2500,
        location: { type: 'Point', coordinates: [80.4365, 16.3067] },
        locationName: 'Guntur, Andhra Pradesh',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner._id,
        name: 'Mahindra 575 DI Bhoomiputra Tractor',
        type: 'tractor',
        description: '45 HP 4-cylinder high fuel efficiency tractor suited for rotavator, cultivator, and trailer haulage.',
        images: ['https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'],
        pricePerDay: 1800,
        location: { type: 'Point', coordinates: [80.6480, 16.5062] },
        locationName: 'Vijayawada, Andhra Pradesh',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner._id,
        name: 'Preet 987 Self-Propelled Combine Harvester',
        type: 'harvester',
        description: 'Heavy duty multi-crop combine harvester for paddy, wheat, and soybean with 14-foot cutter bar.',
        images: ['https://images.unsplash.com/photo-1595838799480-1a1a7bdfd942?auto=format&fit=crop&w=800&q=80'],
        pricePerDay: 4200,
        location: { type: 'Point', coordinates: [78.4867, 17.3850] },
        locationName: 'Hyderabad, Telangana',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner._id,
        name: 'ASPEE HTP Tractor-Mounted Boom Sprayer',
        type: 'sprayer',
        description: 'High pressure 500-liter pesticide and fertilizer sprayer with 24-nozzle adjustable folding booms.',
        images: ['https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80'],
        pricePerDay: 700,
        location: { type: 'Point', coordinates: [79.9864, 14.4426] },
        locationName: 'Nellore, Andhra Pradesh',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner._id,
        name: 'VST Shakti 130 DI Power Tiller',
        type: 'tiller',
        description: '13 HP rugged power tiller ideal for wet puddling, tilling in paddy fields, and intercultural weeding.',
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'],
        pricePerDay: 1100,
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        locationName: 'Bengaluru Rural, Karnataka',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner._id,
        name: 'DJI Agras T40 Precision Agriculture Drone',
        type: 'drone',
        description: 'Coaxial twin-rotor drone with 40 kg spray payload and active phased array radar for orchards and crops.',
        images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'],
        pricePerDay: 3500,
        location: { type: 'Point', coordinates: [73.8567, 18.5204] },
        locationName: 'Pune, Maharashtra',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner._id,
        name: 'Kubota MU4501 4WD Agricultural Tractor',
        type: 'tractor',
        description: 'Japanese engineered 45 HP 4WD tractor offering low vibration, ergonomic suspension, and superior wet field grip.',
        images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'],
        pricePerDay: 2200,
        location: { type: 'Point', coordinates: [76.9558, 11.0168] },
        locationName: 'Coimbatore, Tamil Nadu',
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner._id,
        name: 'Shaktiman Rotary Tiller & Cultivator',
        type: 'tiller',
        description: '6-foot multi-speed gearbox rotavator with boron steel blades for smooth and quick seed bed preparation.',
        images: ['https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80'],
        pricePerDay: 900,
        location: { type: 'Point', coordinates: [74.7421, 13.3409] },
        locationName: 'Udupi, Karnataka',
        status: 'approved',
        isAvailable: true,
      },
    ];

    await Equipment.insertMany(sampleEquipment);
    console.log(`✅ Successfully seeded ${sampleEquipment.length} approved equipment listings with images.`);

    const finalCount = await Equipment.countDocuments();
    console.log('Final equipment count in DB:', finalCount);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
