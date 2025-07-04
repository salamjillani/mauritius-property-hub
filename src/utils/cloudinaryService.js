// Enhanced cloudinaryService.js with better error handling and debugging

export const getCloudinarySignature = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required: No token found");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/cloudinary-signature`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get upload signature: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting Cloudinary signature:", error);
    throw error;
  }
};

export const getAdvertisementCloudinarySignature = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required: No token found");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ads/cloudinary-signature`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get upload signature: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting advertisement Cloudinary signature:", error);
    throw error;
  }
};

const uploadToCloudinaryWithSignature = async (file, getSignatureFn, folder = "property-images") => {
  try {
    console.log("Starting Cloudinary upload for file:", file.name, "to folder:", folder);
    
    // Get signature data
    const signatureData = await getSignatureFn();
    console.log("Signature data received:", signatureData);
    
    const { timestamp, signature, cloudName, apiKey, upload_preset } = signatureData.data;

    // Validate signature data
    if (!timestamp || !signature || !cloudName || !apiKey) {
      throw new Error("Invalid signature data received from server");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("folder", folder);
    
    // Always add upload_preset if it exists in the signature data
    if (upload_preset) {
      formData.append("upload_preset", upload_preset);
    }

    console.log("Uploading to Cloudinary with cloud name:", cloudName);
    console.log("Upload URL:", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    console.log("Upload parameters:", {
      timestamp,
      folder,
      upload_preset,
      api_key: apiKey
    });

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    console.log("Cloudinary response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary error response:", errorText);
      
      let errorMessage = "Image upload failed";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
        errorMessage = `Image upload failed: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Cloudinary upload successful:", data);
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export const uploadToCloudinary = async (file, folder = "property-images") => {
  return uploadToCloudinaryWithSignature(file, getCloudinarySignature, folder);
};

export const uploadAdvertisementToCloudinary = async (file, folder = "advertisements") => {
  return uploadToCloudinaryWithSignature(file, getAdvertisementCloudinarySignature, folder);
};

// Other existing functions remain the same...
export const uploadAgentPhotoToCloudinary = async (file, folder = "agent-photos") => {
  return uploadToCloudinaryWithSignature(file, getAgentCloudinarySignature, folder);
};

export const uploadAgencyLogoToCloudinary = async (file, folder = "agency-logos") => {
  return uploadToCloudinaryWithSignature(file, getAgencyCloudinarySignature, folder);
};

export const uploadPromoterLogoToCloudinary = async (file, folder = "promoter-logos") => {
  return uploadToCloudinaryWithSignature(file, getPromoterCloudinarySignature, folder);
};

export const uploadVerificationDocumentToCloudinary = async (file, folder = "verification-documents") => {
  return uploadToCloudinaryWithSignature(file, getVerificationCloudinarySignature, folder);
};

export const uploadMultipleImages = async (files, folder = "property-images") => {
  try {
    const uploadPromises = Array.from(files).map((file) => uploadToCloudinary(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Multiple image upload error:", error);
    throw error;
  }
};

export const savePropertyImages = async (propertyId, cloudinaryUrls) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${propertyId}/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cloudinaryUrls }),
    });

    if (!response.ok) {
      throw new Error("Failed to save property images");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving property images:", error);
    throw error;
  }
};