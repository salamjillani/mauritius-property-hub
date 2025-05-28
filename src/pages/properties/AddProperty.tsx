// pages/properties/AddProperty.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const AddProperty = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'MUR',
    category: 'for-sale',
    type: 'Apartment',
    address: { street: '', city: '', zipCode: '', latitude: '', longitude: '' },
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: [],
    images: [],
    virtualTourUrl: '',
    isFeatured: false,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: 'Error',
        description: 'Some files are too large. Maximum size is 5MB per image.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Error',
        description: 'Please select only JPEG, PNG, or WebP images.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFiles(files);
    
    // Create preview URLs for display
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: imageUrls.map((url, index) => ({ 
        url, 
        caption: `Image ${index + 1}`,
        isMain: index === 0
      })),
    }));
  };

  const uploadImagesToCloudinary = async (files) => {
    const uploadedImages = [];
    
    try {
      // Get Cloudinary signature
      const signatureResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/cloudinary-signature`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!signatureResponse.ok) {
        const errorData = await signatureResponse.json();
        throw new Error(errorData.message || 'Failed to get upload signature');
      }
      
      const { data: signatureData } = await signatureResponse.json();
      
      // Upload each file to Cloudinary
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', signatureData.timestamp);
        formData.append('signature', signatureData.signature);
        formData.append('folder', signatureData.folder);
        
        // Only append upload_preset if it exists
        if (signatureData.uploadPreset) {
          formData.append('upload_preset', signatureData.uploadPreset);
        }
        
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Cloudinary upload error:', errorText);
          throw new Error(`Failed to upload image ${i + 1}: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        
        if (uploadResult.error) {
          throw new Error(`Cloudinary error for image ${i + 1}: ${uploadResult.error.message}`);
        }
        
        uploadedImages.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          caption: `Image ${i + 1}`,
          isMain: i === 0,
        });
      }
      
      setUploadProgress(0);
      return uploadedImages;
      
    } catch (error) {
      setUploadProgress(0);
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let finalFormData = { ...formData };
      
      // Upload images to Cloudinary if any files are selected
      if (selectedFiles.length > 0) {
        toast({ title: 'Info', description: 'Uploading images...' });
        const uploadedImages = await uploadImagesToCloudinary(selectedFiles);
        finalFormData.images = uploadedImages;
      } else {
        finalFormData.images = [];
      }

      // Convert numeric fields
      if (finalFormData.price) finalFormData.price = Number(finalFormData.price);
      if (finalFormData.bedrooms) finalFormData.bedrooms = Number(finalFormData.bedrooms);
      if (finalFormData.bathrooms) finalFormData.bathrooms = Number(finalFormData.bathrooms);
      if (finalFormData.area) finalFormData.area = Number(finalFormData.area);
      
      // Set up coordinates if latitude and longitude are provided
      if (finalFormData.address.latitude && finalFormData.address.longitude) {
        finalFormData.location = {
          type: 'Point',
          coordinates: [Number(finalFormData.address.longitude), Number(finalFormData.address.latitude)]
        };
      }

      // Remove the preview URLs from address
      const { latitude, longitude, ...addressWithoutCoords } = finalFormData.address;
      finalFormData.address = addressWithoutCoords;

      console.log('Submitting property data:', finalFormData);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Property creation error:', errorData);
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Property created successfully:', result);

      toast({ title: 'Success', description: 'Property added successfully' });
      navigate('/properties');
      
    } catch (error) {
      console.error('Error adding property:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add property',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Add New Property</h1>
        
        {uploadProgress > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Uploading images...</span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
          />
          <Textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength={5000}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
            />
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="MUR">MUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="for-sale">For Sale</SelectItem>
                <SelectItem value="for-rent">For Rent</SelectItem>
                <SelectItem value="offices">Offices</SelectItem>
                <SelectItem value="office-rent">Office Rent</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
                <SelectItem value="Duplex">Duplex</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            name="address.street"
            placeholder="Street Address"
            value={formData.address.street}
            onChange={handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="address.city"
              placeholder="City"
              value={formData.address.city}
              onChange={handleChange}
              required
            />
            <Input
              name="address.zipCode"
              placeholder="Zip Code"
              value={formData.address.zipCode}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="address.latitude"
              type="number"
              step="any"
              placeholder="Latitude (optional)"
              value={formData.address.latitude}
              onChange={handleChange}
            />
            <Input
              name="address.longitude"
              type="number"
              step="any"
              placeholder="Longitude (optional)"
              value={formData.address.longitude}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              name="bedrooms"
              type="number"
              placeholder="Bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              min="0"
            />
            <Input
              name="bathrooms"
              type="number"
              step="0.5"
              placeholder="Bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              min="0"
            />
            <Input
              name="area"
              type="number"
              placeholder="Area (sqm)"
              value={formData.area}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Amenities</h3>
            <div className="grid grid-cols-3 gap-2">
              {['Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Security'].map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityChange(amenity)}
                  />
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Images</h3>
            <Input 
              type="file" 
              multiple 
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Max 10 images, 5MB each. Supported formats: JPEG, PNG, WebP
            </p>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.url}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    {img.isMain && (
                      <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Input
            name="virtualTourUrl"
            placeholder="Virtual Tour URL (optional)"
            value={formData.virtualTourUrl}
            onChange={handleChange}
            type="url"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked === true }))}
            />
            <span className="text-sm">Feature this property</span>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Adding Property...' : 'Add Property'}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AddProperty;