// src/utils/cloudinaryService.js
/**
 * Service for handling Cloudinary uploads
 */

// Get Cloudinary upload signature from backend
export const getCloudinarySignature = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/cloudinary-signature`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get upload signature');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Cloudinary signature:', error);
    throw error;
  }
};

// Upload image directly to Cloudinary
export const uploadToCloudinary = async (file) => {
  try {
    // Get signature for secure upload
    const signatureData = await getCloudinarySignature();
    const { timestamp, signature, cloudName, apiKey } = signatureData.data;

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('api_key', apiKey);
    formData.append('folder', 'property-images');
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    // Upload directly to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload multiple images to Cloudinary
export const uploadMultipleImages = async (files) => {
  try {
    // Map each file to an upload promise
    const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
    
    // Upload all files in parallel
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw error;
  }
};

// Save uploaded Cloudinary images to property
export const savePropertyImages = async (propertyId, cloudinaryUrls) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${propertyId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cloudinaryUrls })
    });

    if (!response.ok) {
      throw new Error('Failed to save property images');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving property images:', error);
    throw error;
  }
};