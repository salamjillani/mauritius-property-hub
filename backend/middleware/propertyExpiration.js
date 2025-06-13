const Property = require('../models/Property');

module.exports = async (req, res, next) => {
  try {
    const expiredListings = await Property.find({
      expiresAt: { $lte: new Date() },
      status: 'active'
    });
    
    for (const listing of expiredListings) {
      listing.status = 'expired';
      await listing.save();
    }
    next();
  } catch (error) {
    console.error('Error expiring listings:', error);
    next();
  }
};