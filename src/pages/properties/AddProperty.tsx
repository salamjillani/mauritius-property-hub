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
    category: 'sale',
    type: 'apartment',
    address: { street: '', city: '', zipCode: '', latitude: '', longitude: '' },
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: [],
    images: [],
    virtualTour: '',
    isFeatured: false,
  });
  const [isLoading, setIsLoading] = useState(false);
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
    const imageUrls = files.map((file) => URL.createObjectURL(file)); // Simplified for demo
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls.map((url) => ({ url, caption: '' }))],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add property');
      }

      toast({ title: 'Success', description: 'Property added successfully' });
      navigate('/properties');
    } catch (error) {
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <Textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
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
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">Rental</SelectItem>
                <SelectItem value="offices">Offices</SelectItem>
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
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
                <SelectItem value="duplex">Duplex</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            name="address.street"
            placeholder="Street"
            value={formData.address.street}
            onChange={handleChange}
          />
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="address.latitude"
              type="number"
              placeholder="Latitude"
              value={formData.address.latitude}
              onChange={handleChange}
            />
            <Input
              name="address.longitude"
              type="number"
              placeholder="Longitude"
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
            />
            <Input
              name="bathrooms"
              type="number"
              placeholder="Bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
            />
            <Input
              name="area"
              type="number"
              placeholder="Area (sqm)"
              value={formData.area}
              onChange={handleChange}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Amenities</h3>
            {['Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Security'].map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                <Checkbox
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityChange(amenity)}
                />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Images</h3>
            <Input type="file" multiple onChange={handleImageUpload} />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {formData.images.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
              ))}
            </div>
          </div>
          <Input
            name="virtualTour"
            placeholder="Virtual Tour URL"
            value={formData.virtualTour}
            onChange={handleChange}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked === true }))}
              disabled={JSON.parse(localStorage.getItem('user') || '{}')?.subscription?.plan === 'basic'}
            />
            <span>Feature this property (Elite/Platinum only)</span>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Add Property'}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AddProperty;