const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fileUpload = require('express-fileupload');

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

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:8080', // Frontend URL
  credentials: true
}));

// File upload middleware
app.use(fileUpload());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});