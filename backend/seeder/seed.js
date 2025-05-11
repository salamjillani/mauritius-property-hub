
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: '../.env' });

// Load models
const User = require('../models/User');
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const Agency = require('../models/Agency');
const Review = require('../models/Review');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Hash password function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Import data into DB
const importData = async () => {
  try {
    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@propertymauritius.com',
      role: 'admin',
      password: adminPassword
    });
    console.log('Admin user created');

    // Create agencies (4)
    const agenciesData = [
      {
        user: await createAgencyUser('Island Prestige Properties', 1),
        name: 'Island Prestige Properties',
        description: 'Leading luxury real estate agency in Mauritius specializing in high-end properties.',
        logoUrl: 'agency_logo_1.png',
        establishedYear: 2010,
        address: {
          street: '10 Beach Avenue',
          city: 'Grand Baie',
          zipCode: '30510',
          country: 'Mauritius'
        },
        location: {
          type: 'Point',
          coordinates: [57.5522, -20.0064]
        },
        contactDetails: {
          email: 'info@islandprestige.mu',
          phone: '+230 5800 1234',
          website: 'www.islandprestige.mu'
        },
        isPremium: true
      },
      {
        user: await createAgencyUser('Mauritius Luxury Estates', 2),
        name: 'Mauritius Luxury Estates',
        description: 'Specialists in luxury properties and exclusive developments across Mauritius.',
        logoUrl: 'agency_logo_2.png',
        establishedYear: 2008,
        address: {
          street: '25 Marina Road',
          city: 'Port Louis',
          zipCode: '11328',
          country: 'Mauritius'
        },
        location: {
          type: 'Point',
          coordinates: [57.5042, -20.1609]
        },
        contactDetails: {
          email: 'sales@mauritiusluxury.mu',
          phone: '+230 5800 5678',
          website: 'www.mauritiusluxury.mu'
        },
        isPremium: true
      },
      {
        user: await createAgencyUser('Commercial Property Solutions', 3),
        name: 'Commercial Property Solutions',
        description: 'Commercial property experts for businesses in Mauritius.',
        logoUrl: 'agency_logo_3.png',
        establishedYear: 2015,
        address: {
          street: '42 Business Avenue',
          city: 'Ebene',
          zipCode: '72201',
          country: 'Mauritius'
        },
        location: {
          type: 'Point',
          coordinates: [57.4862, -20.2429]
        },
        contactDetails: {
          email: 'info@commercialpropertysolutions.mu',
          phone: '+230 5800 9012',
          website: 'www.commercialpropertysolutions.mu'
        },
        isPremium: false
      },
      {
        user: await createAgencyUser('Beachfront Realty', 4),
        name: 'Beachfront Realty',
        description: 'Focused on beachfront and ocean view properties around the island.',
        logoUrl: 'agency_logo_4.png',
        establishedYear: 2012,
        address: {
          street: '8 Coastal Road',
          city: 'Flic en Flac',
          zipCode: '90503',
          country: 'Mauritius'
        },
        location: {
          type: 'Point',
          coordinates: [57.3593, -20.2732]
        },
        contactDetails: {
          email: 'contact@beachfrontrealty.mu',
          phone: '+230 5800 3456',
          website: 'www.beachfrontrealty.mu'
        },
        isPremium: true
      }
    ];

    const agencies = await Agency.insertMany(agenciesData);
    console.log(`${agencies.length} agencies created`);

    // Create agents (8)
    const agentsData = [
      {
        user: await createAgentUser('Marie Laurent', 1),
        title: 'Senior Property Consultant',
        biography: 'With over 15 years of experience in luxury real estate, Marie is an expert in helping clients find their dream properties in Mauritius.',
        specializations: ['Luxury Villas', 'Beachfront Properties'],
        location: 'Grand Baie',
        licenseNumber: 'REAL-001-2010',
        agency: agencies[0]._id, // Island Prestige Properties
        isPremium: true,
        languages: ['English', 'French', 'Creole']
      },
      {
        user: await createAgentUser('Jean Dupont', 2),
        title: 'Luxury Property Specialist',
        biography: 'Jean specializes in high-end properties in the north of Mauritius, with particular expertise in waterfront estates.',
        specializations: ['Luxury Properties', 'Investment Properties'],
        location: 'Port Louis',
        licenseNumber: 'REAL-023-2012',
        agency: agencies[1]._id, // Mauritius Luxury Estates
        isPremium: true,
        languages: ['English', 'French']
      },
      {
        user: await createAgentUser('Sarah Johnson', 3),
        title: 'Commercial Property Expert',
        biography: 'Sarah is an expert in commercial real estate, helping businesses find the perfect office or retail space in Mauritius.',
        specializations: ['Office Spaces', 'Retail Properties', 'Industrial'],
        location: 'Ebene',
        licenseNumber: 'REAL-045-2015',
        agency: agencies[2]._id, // Commercial Property Solutions
        isPremium: true,
        languages: ['English']
      },
      {
        user: await createAgentUser('Michael Wong', 4),
        title: 'Investment Property Advisor',
        biography: 'Michael specializes in helping investors find profitable real estate opportunities in Mauritius.',
        specializations: ['Investment Properties', 'Land Development'],
        location: 'Flic en Flac',
        licenseNumber: 'REAL-067-2014',
        agency: agencies[0]._id, // Island Prestige Properties
        isPremium: true,
        languages: ['English', 'French', 'Mandarin']
      },
      {
        user: await createAgentUser('Sophie Martin', 5),
        title: 'Residential Sales Specialist',
        biography: 'Sophie helps families find their perfect home in Mauritius with a focus on residential properties in central regions.',
        specializations: ['Apartments', 'Family Homes'],
        location: 'Quatre Bornes',
        licenseNumber: 'REAL-089-2016',
        agency: agencies[1]._id, // Mauritius Luxury Estates
        isPremium: false,
        languages: ['English', 'French', 'Creole']
      },
      {
        user: await createAgentUser('Daniel Leroy', 6),
        title: 'Rental Property Manager',
        biography: 'Daniel specializes in rental properties, helping landlords find tenants and tenants find their ideal rental home.',
        specializations: ['Rental Properties', 'Property Management'],
        location: 'Tamarin',
        licenseNumber: 'REAL-102-2017',
        agency: agencies[3]._id, // Beachfront Realty
        isPremium: true,
        languages: ['English', 'French']
      },
      {
        user: await createAgentUser('Alisha Ramdin', 7),
        title: 'Coastal Property Specialist',
        biography: 'Alisha focuses on properties along the eastern and southern coasts of Mauritius, specializing in secluded luxury homes.',
        specializations: ['Beachfront', 'Oceanview Properties'],
        location: 'Belle Mare',
        licenseNumber: 'REAL-124-2018',
        agency: agencies[3]._id, // Beachfront Realty
        isPremium: false,
        languages: ['English', 'French', 'Hindi']
      },
      {
        user: await createAgentUser('Robert Smith', 8),
        title: 'International Client Advisor',
        biography: 'Robert works primarily with international clients looking to purchase property in Mauritius, handling all aspects of the buying process.',
        specializations: ['Foreign Investments', 'Luxury Properties'],
        location: 'Grand Baie',
        licenseNumber: 'REAL-146-2019',
        agency: agencies[0]._id, // Island Prestige Properties
        isPremium: true,
        languages: ['English', 'German', 'French']
      }
    ];

    const agents = await Agent.insertMany(agentsData);
    console.log(`${agents.length} agents created`);

    // Create individual users (4)
    const individualUsers = await Promise.all([
      createIndividualUser(1),
      createIndividualUser(2),
      createIndividualUser(3),
      createIndividualUser(4)
    ]);
    console.log(`${individualUsers.length} individual users created`);

    // Create properties (20)
    const propertiesData = generatePropertiesData(agents, agencies);
    const properties = await Property.insertMany(propertiesData);
    console.log(`${properties.length} properties created`);

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Property.deleteMany();
    await Agent.deleteMany();
    await Agency.deleteMany();
    await Review.deleteMany();
    
    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Helper functions for creating users
async function createAgencyUser(name, num) {
  const password = await hashPassword('password123');
  const user = await User.create({
    firstName: name.split(' ')[0],
    lastName: 'Agency',
    email: `agency${num}@propertymauritius.com`,
    role: 'agency',
    password: password
  });
  return user._id;
}

async function createAgentUser(name, num) {
  const password = await hashPassword('password123');
  const nameParts = name.split(' ');
  const user = await User.create({
    firstName: nameParts[0],
    lastName: nameParts[1] || 'Agent',
    email: `agent${num}@propertymauritius.com`,
    role: 'agent',
    password: password,
    avatarUrl: `agent_${num}.jpg`
  });
  return user._id;
}

async function createIndividualUser(num) {
  const password = await hashPassword('password123');
  const user = await User.create({
    firstName: `User${num}`,
    lastName: `Individual`,
    email: `user${num}@example.com`,
    role: 'individual',
    password: password
  });
  return user._id;
}

// Generate properties data
function generatePropertiesData(agents, agencies) {
  const propertiesData = [
    {
      title: 'Luxury Beach Villa',
      description: 'Spectacular beachfront villa with private pool and ocean views. This stunning property offers direct access to one of the most beautiful beaches in Mauritius. Featuring 4 spacious bedrooms, each with ensuite bathrooms, a gourmet kitchen, and expansive living areas that open to a large terrace. The property includes a private infinity pool overlooking the ocean, landscaped tropical gardens, and a private pathway to the beach.',
      address: {
        street: '10 Beach Road',
        city: 'Grand Baie',
        zipCode: '30510',
        country: 'Mauritius'
      },
      location: {
        type: 'Point',
        coordinates: [57.5522, -20.0064]
      },
      price: 15000000,
      type: 'Villa',
      category: 'for-sale',
      status: 'active',
      featured: true,
      isPremium: true,
      size: 350,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['Swimming Pool', 'Beach Access', 'Garden', 'Terrace', 'Sea View', 'Security', 'Air Conditioning'],
      images: [
        {
          url: 'property_1_main.jpg',
          caption: 'Villa Exterior',
          isMain: true
        },
        {
          url: 'property_1_2.jpg',
          caption: 'Pool Area',
          isMain: false
        }
      ],
      owner: agents[0].user,
      agent: agents[0]._id,
      agency: agencies[0]._id
    },
    {
      title: 'Modern City Apartment',
      description: 'Contemporary apartment in downtown Port Louis with great city views. This stylish urban residence offers modern living in the heart of the capital. The open-plan design features high-quality finishes, a state-of-the-art kitchen, and floor-to-ceiling windows that flood the space with natural light and showcase spectacular city views. The building offers secure parking, 24-hour security, and a rooftop communal area with pool.',
      address: {
        street: '25 Independence Avenue',
        city: 'Port Louis',
        zipCode: '11328',
        country: 'Mauritius'
      },
      location: {
        type: 'Point',
        coordinates: [57.5042, -20.1609]
      },
      price: 5500000,
      type: 'Apartment',
      category: 'for-sale',
      status: 'active',
      featured: true,
      isPremium: false,
      size: 120,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['City View', 'Security', 'Elevator', 'Parking', 'Air Conditioning', 'Gym'],
      images: [
        {
          url: 'property_2_main.jpg',
          caption: 'Living Room with View',
          isMain: true
        },
        {
          url: 'property_2_2.jpg',
          caption: 'Kitchen',
          isMain: false
        }
      ],
      owner: agents[1].user,
      agent: agents[1]._id,
      agency: agencies[1]._id
    },
    {
      title: 'Executive Office Space',
      description: 'Premium office space in the Cybercity area of Ebene. This professional office environment is ideal for businesses seeking a prestigious address in Mauritius\'s premier business district. The space features modern interiors, high-speed internet infrastructure, conference facilities, and an efficient layout. The building offers secure parking, 24-hour access, and professional management.',
      address: {
        street: '42 Cyber Avenue',
        city: 'Ebene',
        zipCode: '72201',
        country: 'Mauritius'
      },
      location: {
        type: 'Point',
        coordinates: [57.4862, -20.2429]
      },
      price: 65000,
      rentalPeriod: 'month',
      type: 'Office',
      category: 'office-rent',
      status: 'active',
      featured: true,
      isPremium: true,
      size: 200,
      amenities: ['24/7 Access', 'Security', 'Parking', 'Conference Room', 'High-speed Internet', 'Air Conditioning'],
      images: [
        {
          url: 'property_3_main.jpg',
          caption: 'Office Interior',
          isMain: true
        },
        {
          url: 'property_3_2.jpg',
          caption: 'Conference Room',
          isMain: false
        }
      ],
      owner: agents[2].user,
      agent: agents[2]._id,
      agency: agencies[2]._id
    },
    // Add more properties...
    {
      title: 'Beachfront Land',
      description: 'Prime beachfront land suitable for hotel or villa development in Flic en Flac. This exceptional parcel of land offers one of the last remaining beachfront development opportunities on the west coast of Mauritius. With approximately 1500 square meters and 30 meters of beach frontage, the site has approved permits for either a luxury villa residence or a boutique hotel development. The location offers stunning sunset views and is within walking distance to local amenities.',
      address: {
        street: '8 Coastal Road',
        city: 'Flic en Flac',
        zipCode: '90503',
        country: 'Mauritius'
      },
      location: {
        type: 'Point',
        coordinates: [57.3593, -20.2732]
      },
      price: 28000000,
      type: 'Land',
      category: 'land',
      status: 'active',
      featured: true,
      isPremium: false,
      size: 1500,
      amenities: ['Beach Access', 'Development Potential', 'Sunset Views', 'Infrastructure Ready'],
      images: [
        {
          url: 'property_4_main.jpg',
          caption: 'Land View',
          isMain: true
        },
        {
          url: 'property_4_2.jpg',
          caption: 'Beach Access',
          isMain: false
        }
      ],
      owner: agents[3].user,
      agent: agents[3]._id,
      agency: agencies[0]._id
    },
    {
      title: 'Vacation Rental Villa',
      description: 'Stunning villa available for short-term vacation rentals in Trou aux Biches. This beautiful vacation property offers a perfect getaway in one of Mauritius\'s most sought-after beach locations. The villa features 3 comfortable bedrooms, an open-plan living area, and a well-equipped kitchen. Outside, guests can enjoy a private swimming pool, tropical garden, and a covered terrace perfect for alfresco dining. Just 200 meters from the white sands of Trou aux Biches beach.',
      address: {
        street: '15 Seaside Lane',
        city: 'Trou aux Biches',
        zipCode: '30410',
        country: 'Mauritius'
      },
      location: {
        type: 'Point',
        coordinates: [57.5387, -20.0313]
      },
      price: 15000,
      rentalPeriod: 'week',
      type: 'Villa',
      category: 'for-rent',
      status: 'active',
      featured: true,
      isPremium: true,
      size: 220,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['Swimming Pool', 'Garden', 'Beach Nearby', 'Air Conditioning', 'Wifi', 'BBQ Area'],
      images: [
        {
          url: 'property_5_main.jpg',
          caption: 'Villa with Pool',
          isMain: true
        },
        {
          url: 'property_5_2.jpg',
          caption: 'Living Area',
          isMain: false
        }
      ],
      availableDates: [
        {
          from: new Date('2023-11-01'),
          to: new Date('2023-12-15')
        },
        {
          from: new Date('2024-01-10'),
          to: new Date('2024-06-30')
        }
      ],
      owner: agents[7].user,
      agent: agents[7]._id,
      agency: agencies[3]._id
    }
    // Add more properties as needed to reach 20
  ];

  // Generate additional properties to reach 20
  for(let i = 6; i <= 20; i++) {
    const agentIndex = (i - 1) % agents.length;
    const agencyIndex = (i - 1) % agencies.length;
    
    const propertyTypes = ['Apartment', 'House', 'Villa', 'Office', 'Land'];
    const propertyType = propertyTypes[(i - 1) % propertyTypes.length];
    
    const categories = ['for-sale', 'for-rent', 'offices', 'office-rent', 'land'];
    let category;
    
    // Select appropriate category based on type
    if (propertyType === 'Office') {
      category = i % 2 === 0 ? 'offices' : 'office-rent';
    } else if (propertyType === 'Land') {
      category = 'land';
    } else {
      category = i % 2 === 0 ? 'for-sale' : 'for-rent';
    }
    
    const isPremium = i % 3 === 0;
    const featured = i % 4 === 0;
    
    const cities = ['Grand Baie', 'Port Louis', 'Ebene', 'Flic en Flac', 'Tamarin', 'Belle Mare', 'Quatre Bornes', 'Trou aux Biches'];
    const city = cities[i % cities.length];
    
    const basePrice = category.includes('rent') ? 25000 : 3500000;
    const price = basePrice + (i * 500000);
    
    // Create different coordinates for each property
    const baseLatitude = -20.1609; // Port Louis
    const baseLongitude = 57.5042;
    const latitude = baseLatitude + (i * 0.01);
    const longitude = baseLongitude + (i * 0.01);
    
    const property = {
      title: `${propertyType} ${i} in ${city}`,
      description: `A beautiful ${propertyType.toLowerCase()} located in ${city}, featuring modern amenities and great location.`,
      address: {
        street: `${i} Sample Street`,
        city: city,
        country: 'Mauritius'
      },
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      price: price,
      rentalPeriod: category.includes('rent') ? (i % 2 === 0 ? 'month' : 'week') : '',
      type: propertyType,
      category: category,
      status: 'active',
      featured: featured,
      isPremium: isPremium,
      size: 100 + (i * 10),
      bedrooms: propertyType !== 'Land' && propertyType !== 'Office' ? 1 + (i % 4) : 0,
      bathrooms: propertyType !== 'Land' && propertyType !== 'Office' ? 1 + (i % 3) : 0,
      amenities: ['Security', 'Parking'],
      images: [
        {
          url: `property_${i}_main.jpg`,
          caption: `${propertyType} ${i}`,
          isMain: true
        },
        {
          url: `property_${i}_2.jpg`,
          caption: 'Interior View',
          isMain: false
        }
      ],
      owner: agents[agentIndex].user,
      agent: agents[agentIndex]._id,
      agency: agencies[agencyIndex]._id
    };
    
    propertiesData.push(property);
  }
  
  return propertiesData;
}

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please add proper command: -i (import) or -d (delete)');
  process.exit();
}
