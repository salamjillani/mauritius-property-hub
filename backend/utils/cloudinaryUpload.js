// utils/cloudinaryUpload.js
const cloudinary = require('../config/cloudinary');

/**
 * Upload an image to Cloudinary
 * @param {String} imageString - Base64 encoded image or image URL
 * @param {String} folder - Folder name in cloudinary (optional)
 * @returns {Object} Cloudinary upload response
 */
const uploadImage = async (imageString, folder = 'property-images') => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(imageString, {
      folder,
      resource_type: 'auto'
    });
    
    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};

/**
 * Delete an image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 */
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

module.exports = {
  uploadImage,
  deleteImage
};