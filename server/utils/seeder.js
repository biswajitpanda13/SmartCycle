const Station = require('../models/Station');
const Bicycle = require('../models/Bicycle');
const User    = require('../models/User');

const stationsData = [
  "PULAHA HALL OF RESIDENCE",
  "PULASTYA HALL OF RESIDENCE",
  "AGASTYA HALL OF RESIDENCE",
  "ATRI HALL OF RESIDENCE",
  "MARICHI HALL OF RESIDENCE",
  "KRATU HALL OF RESIDENCE",
  "VASISTHA HALL OF RESIDENCE",
  "ROHINI HALL OF RESIDENCE",
  "VASUNDHARA HALL OF RESIDENCE",
  "ARUNDHATI HALL OF RESIDENCE",
  "ANURADHA HALL OF RESIDENCE",
  "VISHAKHA HALL OF RESIDENCE",
  "UNIVERSITY CENTRAL PARKING"
];

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartcycle.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
    return;
  }

  await User.create({
    name: 'System Admin',
    rollNumber: 'ADMIN001',
    email: adminEmail,
    password: adminPassword,
    role: 'admin'
  });

  console.log(`✅ Admin account created → Email: ${adminEmail} | Password: ${adminPassword}`);
};

const seedDatabase = async () => {
  try {
    // Always ensure admin exists
    await seedAdmin();

    const stationCount = await Station.countDocuments();
    if (stationCount > 0) {
      console.log('Stations already seeded.');
      return;
    }

    console.log('Seeding stations and bicycles...');

    const stationsToInsert = stationsData.map(name => {
      let count = 200;
      if (name === "PULAHA HALL OF RESIDENCE") count = 1000;
      else if (name === "AGASTYA HALL OF RESIDENCE") count = 400;
      else if (name === "UNIVERSITY CENTRAL PARKING") count = 0;
      return {
        stationName: name,
        location: `${name} Campus Area`,
        totalBikes: count
      };
    });

    const insertedStations = await Station.insertMany(stationsToInsert);

    const bicyclesToInsert = [];
    insertedStations.forEach((station, index) => {
      for (let i = 1; i <= station.totalBikes; i++) {
        bicyclesToInsert.push({
          bikeId: `CCL${index + 1}-${i}`,
          bicycleName: `SmartCycle Model X`,
          station: station._id,
          status: 'available'
        });
      }
    });

    const chunkSize = 1000;
    for (let i = 0; i < bicyclesToInsert.length; i += chunkSize) {
      const chunk = bicyclesToInsert.slice(i, i + chunkSize);
      await Bicycle.insertMany(chunk);
      console.log(`Inserted bicycles chunk ${i} to ${i + chunk.length}`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
