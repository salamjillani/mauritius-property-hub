import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mauritiusDistricts from '@/data/mauritiusDistricts.json';

// Define interfaces for type safety
interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
  latitude?: string;
  longitude?: string;
}

interface Image {
  url: string;
  publicId?: string;
  caption: string;
  isMain: boolean;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  currency: 'USD' | 'EUR' | 'MUR';
  category: 'for-sale' | 'for-rent' | 'offices' | 'office-rent' | 'land';
  type: string;
  address: Address;
  bedrooms: string;
  bathrooms: string;
  area: string;
  amenities: string[];
  images: Image[];
  virtualTourUrl: string;
  isPremium: boolean;
  isGoldCard: boolean;
}

interface User {
  _id: string;
  role: 'individual' | 'agent' | 'agency' | 'promoter' | 'admin' | 'sub-admin';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  listingLimit: number;
  goldCards: number;
}

// Get all district names from the JSON data
const getAvailableDistricts = () => {
  return mauritiusDistricts.features.map(feature => feature.properties.name).sort();
};

// Get GeoJSON for a specific district
const getGeoJsonForDistrict = (districtName: string) => {
  const feature = mauritiusDistricts.features.find(f => f.properties.name === districtName);
  if (!feature) return null;
  
  return {
    type: 'FeatureCollection',
    features: [feature]
  };
};

// Get center coordinates for a district
const getDistrictCenter = (districtName: string): [number, number] | null => {
  const feature = mauritiusDistricts.features.find(f => f.properties.name === districtName);
  if (!feature) return null;
  
  // Calculate center of the polygon
  const coordinates = feature.geometry.coordinates[0];
  const lats = coordinates.map(coord => coord[1]);
  const lngs = coordinates.map(coord => coord[0]);
  
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  
  return [centerLat, centerLng];
};

// Custom hook to handle map interactions and district highlighting
const MapController = ({ selectedDistrict, setMarkerPosition, setFormData }) => {
  const map = useMap();
  const geoJsonLayerRef = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          latitude: lat.toString(),
          longitude: lng.toString()
        }
      }));
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, setMarkerPosition, setFormData]);

  // Handle district highlighting
  useEffect(() => {
    // Remove previous GeoJSON layer if it exists
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (selectedDistrict) {
      const geoJsonData = getGeoJsonForDistrict(selectedDistrict);
      if (geoJsonData) {
        // Create new GeoJSON layer
        const geoJsonLayer = L.geoJSON(geoJsonData, {
          style: () => ({ 
            color: '#4f46e5', 
            weight: 2, 
            fillOpacity: 0.1,
            fillColor: '#4f46e5'
          })
        });

        // Add to map and store reference
        geoJsonLayer.addTo(map);
        geoJsonLayerRef.current = geoJsonLayer;

        // Fit bounds to the district
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
      }
    }

    // Cleanup function
    return () => {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
    };
  }, [selectedDistrict, map]);

  return null;
};

const AddProperty = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    currency: 'MUR',
    category: 'for-sale',
    type: 'Apartment',
    address: { street: '', city: '', country: '', zipCode: '', latitude: '', longitude: '' },
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: [],
    images: [],
    virtualTourUrl: '',
    isPremium: false,
    isGoldCard: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const availableDistricts = getAvailableDistricts();

  // Fix leaflet default icon
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: '/marker-icon.png',
      iconRetinaUrl: '/marker-icon-2x.png',
      shadowUrl: '/marker-shadow.png',
    });
  }, []);

  // Set initial marker position
  useEffect(() => {
    if (formData.address.latitude && formData.address.longitude) {
      setMarkerPosition([
        parseFloat(formData.address.latitude),
        parseFloat(formData.address.longitude)
      ]);
    }
  }, []);

  // Update form data when district is selected
  useEffect(() => {
    if (!selectedDistrict) return;
    
    // Auto-fill the city field with selected district
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: selectedDistrict
      }
    }));
    
    // Auto-center marker on district
    const districtCenter = getDistrictCenter(selectedDistrict);
    if (districtCenter) {
      setMarkerPosition(districtCenter);
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          latitude: districtCenter[0].toString(),
          longitude: districtCenter[1].toString()
        }
      }));
    }
  }, [selectedDistrict]);

  // Fetch user data to check listing limits and gold cards
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        toast({
          title: 'Authentication Required',
          description: 'Please log in to add a property.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUser(data.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load user data.',
          variant: 'destructive',
        });
      }
    };

    fetchUser();
  }, [navigate, toast]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1] as keyof Address;
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    // Validate file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);
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
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: 'Error',
        description: 'Please select only JPEG, PNG, or WebP images.',
        variant: 'destructive',
      });
      return;
    }

    // Limit to 10 images
    if (files.length > 10) {
      toast({
        title: 'Error',
        description: 'You can upload a maximum of 10 images.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFiles(files);

    // Create preview URLs for display
    const imageUrls = files.map((file, index) => ({
      url: URL.createObjectURL(file),
      caption: `Image ${index + 1}`,
      isMain: index === 0,
    }));
    setFormData((prev) => ({
      ...prev,
      images: imageUrls,
    }));
  };

  const uploadImagesToCloudinary = async (files: File[]): Promise<Image[]> => {
    const uploadedImages: Image[] = [];
    const token = localStorage.getItem('token');

    try {
      // Get Cloudinary signature
      const signatureResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/cloudinary-signature`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
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
        formData.append('timestamp', signatureData.timestamp.toString());
        formData.append('signature', signatureData.signature);
        formData.append('folder', signatureData.folder);

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
          throw new Error(`Failed to upload image ${i + 1}: ${errorText}`);
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

      return uploadedImages;
    } finally {
      setUploadProgress(0);
    }
  };

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  // Move user validation to the top
  if (!user) {
    toast({ title: 'Error', description: 'User not loaded', variant: 'destructive' });
    return;
  }

  if (!formData.area || isNaN(Number(formData.area))) {
    toast({
      title: 'Validation Error',
      description: 'Please enter a valid area in square meters',
      variant: 'destructive',
    });
    return;
  }

  setIsLoading(true);

  try {
    // Validate listing limit
    const token = localStorage.getItem('token');
    const listingsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?owner=${user._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!listingsResponse.ok) {
      throw new Error('Failed to check listing limit');
    }
    
    const listingsData = await listingsResponse.json();
    const currentListings = listingsData.count;

    if (user.listingLimit > 0 && currentListings >= user.listingLimit) {
      toast({
        title: 'Error',
        description: 'You have reached your listing limit. Please contact support to increase your limit.',
        variant: 'destructive',
      });
      return;
    }

    // Validate gold card usage
    if (formData.isGoldCard && user.goldCards <= 0) {
      toast({
        title: 'Error',
        description: 'You have no gold cards available.',
        variant: 'destructive',
      });
      return;
    }

    let finalFormData = { ...formData, owner: user._id };

    // Upload images to Cloudinary if any files are selected
    if (selectedFiles.length > 0) {
      toast({ title: 'Uploading Images', description: 'Please wait while images are being uploaded...' });
      finalFormData.images = await uploadImagesToCloudinary(selectedFiles);
    } else {
      finalFormData.images = [];
    }

    // Convert numeric fields
    finalFormData.price = finalFormData.price ? Number(finalFormData.price) : 0;
    finalFormData.bedrooms = finalFormData.bedrooms ? Number(finalFormData.bedrooms) : undefined;
    finalFormData.bathrooms = finalFormData.bathrooms ? Number(finalFormData.bathrooms) : undefined;
    finalFormData.area = Number(formData.area); // Keep as area, don't convert to size

    // Set up location if coordinates are provided
    if (finalFormData.address.latitude && finalFormData.address.longitude) {
      finalFormData.location = {
        type: 'Point',
        coordinates: [Number(finalFormData.address.longitude), Number(finalFormData.address.latitude)],
      };
    }

    // Remove coordinates from address
    const { latitude, longitude, ...addressWithoutCoords } = finalFormData.address;
    finalFormData.address = {
      ...addressWithoutCoords,
      country: addressWithoutCoords.country || 'Mauritius',
    };

    // REMOVED: Don't map area to size and delete area
    // finalFormData.size = finalFormData.area;
    // delete finalFormData.area;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalFormData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create property');
    }

    toast({
      title: 'Success',
      description: 'Property added successfully. It is pending admin approval.',
    });
    navigate('/profile');
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to add property',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Add New Property</h1>

        {user && (
          <p className="text-gray-600 mb-4">
            Listings Remaining: {user.listingLimit === null ? 'Unlimited' : user.listingLimit - 0} | 
            Gold Cards Available: {user.goldCards}
          </p>
        )}

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Property Title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the property"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={5000}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value as FormData['currency'] }))}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="MUR">MUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as FormData['category'] }))}
              >
                <SelectTrigger id="category">
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
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="type">
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
          </div>

          <div>
            <Label htmlFor="address.street">Street Address</Label>
            <Input
              id="address.street"
              name="address.street"
              placeholder="Street Address"
              value={formData.address.street}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address.city">City/District</Label>
              <Input
                id="address.city"
                name="address.city"
                placeholder="City/District"
                value={formData.address.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="address.zipCode">Zip Code</Label>
              <Input
                id="address.zipCode"
                name="address.zipCode"
                placeholder="Zip Code"
                value={formData.address.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label>Location</Label>
            <div className="mb-4">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a district/area" />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="h-96 w-full rounded-lg overflow-hidden">
              <MapContainer 
                center={[-20.2, 57.5]} 
                zoom={10} 
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markerPosition && <Marker position={markerPosition} />}
                <MapController 
                  selectedDistrict={selectedDistrict}
                  setMarkerPosition={setMarkerPosition} 
                  setFormData={setFormData} 
                />
              </MapContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="address.latitude">Latitude</Label>
                <Input
                  id="address.latitude"
                  name="address.latitude"
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.address.latitude}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address.longitude">Longitude</Label>
                <Input
                  id="address.longitude"
                  name="address.longitude"
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.address.longitude}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                placeholder="Bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                step="0.5"
                placeholder="Bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="area">Area (sqm)</Label>
              <Input
                id="area"
                name="area"
                type="number"
                placeholder="Area"
                value={formData.area}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <Label>Amenities</Label>
            <div className="grid grid-cols-3 gap-2">
              {['Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Security'].map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityChange(amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
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

          <div>
            <Label htmlFor="virtualTourUrl">Virtual Tour URL (Optional)</Label>
            <Input
              id="virtualTourUrl"
              name="virtualTourUrl"
              placeholder="Virtual Tour URL"
              value={formData.virtualTourUrl}
              onChange={handleChange}
              type="url"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPremium: checked === true }))}
              />
              <Label htmlFor="isPremium">Premium Listing</Label>
            </div>
            {user && user.goldCards > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isGoldCard"
                  checked={formData.isGoldCard}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isGoldCard: checked === true }))}
                />
                <Label htmlFor="isGoldCard">Gold Card Listing (Available: {user.goldCards})</Label>
              </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Adding Property...' : 'Add Property'}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AddProperty;