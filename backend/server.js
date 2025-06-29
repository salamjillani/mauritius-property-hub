const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cron = require('node-cron');
const Property = require('./models/Property');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fileUpload = require('express-fileupload');
const articleRoutes = require('./routes/articles');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const propertyRoutes = require('./routes/properties');
const agencyRoutes = require('./routes/agencies');
const agentRoutes = require('./routes/agents');
const inquiryRoutes = require('./routes/inquiries');
const favoriteRoutes = require('./routes/favorites');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const availabilityRoutes = require('./routes/availability');
const promoterRoutes = require('./routes/promoters');
const projectRoutes = require('./routes/projects');
const reviewRoutes = require('./routes/reviews');
const verificationRoutes = require('./routes/verifications');
const advertisementRoutes = require('./routes/advertisements');
const newsletterRoutes = require('./routes/newsletter');
const supportRoutes = require('./routes/support');
const contentRoutes = require('./routes/content');
const locationsRoutes = require('./routes/locations');
const registrationRequestsRoutes = require('./routes/registrationRoutes');
const registration = require('./routes/registrationRoutes');

// Initialize Express app
const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080', // Use env variable for flexibility
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// File upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true,
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Property expiration middleware (moved after app initialization)
app.use(require('./middleware/propertyExpiration'));

// Set static folder for uploaded files
app.use('/public/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/projects', projectRoutes );
app.use('/api/promoters', promoterRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/registration-requests', registration);
app.use('/api/registration-requests', registrationRequestsRoutes);
app.use('/api/articles', require('./routes/articles'));
app.use('/api/advertisements', require('./routes/advertisements'));
app.use('/api', articleRoutes);

// Cron job for expiring listings
cron.schedule('0 0 * * *', async () => {
  try {
    const expiredListings = await Property.find({
      expiresAt: { $lte: new Date() },
      status: 'active'
    });
    
    for (const listing of expiredListings) {
      listing.status = 'expired';
      await listing.save();
    }
    
    console.log(`Expired ${expiredListings.length} listings`);
  } catch (error) {
    console.error('Error expiring listings:', error);
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Error handler middleware (must be after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});