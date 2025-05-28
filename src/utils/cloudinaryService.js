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

export const getAgentCloudinarySignature = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required: No token found");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/cloudinary-signature`, {
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
    console.error("Error getting agent Cloudinary signature:", error);
    throw error;
  }
};

export const getAgencyCloudinarySignature = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required: No token found");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/cloudinary-signature`, {
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
    console.error("Error getting agency Cloudinary signature:", error);
    throw error;
  }
};

export const getPromoterCloudinarySignature = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required: No token found");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/promoters/cloudinary-signature`, {
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
    console.error("Error getting promoter Cloudinary signature:", error);
    throw error;
  }
};

export const getVerificationCloudinarySignature = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required: No token found");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verifications/cloudinary-signature`, {
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
    console.error("Error getting verification Cloudinary signature:", error);
    throw error;
  }
};

const uploadToCloudinaryWithSignature = async (file, getSignatureFn, folder = "property-images") => {
  try {
    const signatureData = await getSignatureFn();
    const { timestamp, signature, cloudName, apiKey } = signatureData.data;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("folder", folder);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
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