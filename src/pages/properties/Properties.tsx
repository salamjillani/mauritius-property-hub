import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Define interfaces for type safety
interface Address {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

interface Subscription {
  plan?: 'platinum' | 'elite' | 'basic';
}

interface PropertyImage {
  url: string;
}

interface Property {
  _id: string;
  title: string;
  price: number;
  address?: Address;
  subscription?: Subscription;
  images?: PropertyImage[];
  status: string;
}

interface Filters {
  category: string;
  type: string;
  maxPrice: string;
  amenities: string[];
  beds: string;
  rooms: string;
  area: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<Filters>({
    category: '',
    type: '',
    maxPrice: '',
    amenities: [],
    beds: '',
    rooms: '',
    area: '',
  });
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [activeCurrency, setActiveCurrency] = useState('MUR');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Create query params, filtering out empty values
        const queryParams = new URLSearchParams();
        // Always fetch approved properties
        queryParams.set('status', 'approved');
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
            if (Array.isArray(value)) {
              value.forEach((v) => queryParams.append(key, v));
            } else {
              queryParams.set(key, value.toString());
            }
          }
        });

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch properties');

        const data = await response.json();
        setProperties(data.data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: 'Error',
          description: 'Failed to load properties',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [filters, toast]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Simple marker clustering alternative using custom icons
  const createClusterIcon = (count: number) => {
    return L.divIcon({
      html: `<div style="background-color: #3B82F6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: [30, 30],
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        activeLanguage={activeLanguage}
        setActiveLanguage={setActiveLanguage}
        activeCurrency={activeCurrency}
        setActiveCurrency={setActiveCurrency}
      />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Search className="h-8 w-8" />
            Find Properties
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              name="maxPrice"
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
            <Select
              value={filters.category}
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="for-sale">For Sale</SelectItem>
                <SelectItem value="for-rent">For Rent</SelectItem>
                <SelectItem value="offices">Offices</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Input
              name="beds"
              type="number"
              placeholder="Beds"
              value={filters.beds}
              onChange={handleFilterChange}
            />
            <Input
              name="area"
              type="number"
              placeholder="Area (sqm)"
              value={filters.area}
              onChange={handleFilterChange}
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className="text-sm text-gray-600">
              {properties.length} properties found
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading properties...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MapContainer
                center={[-20.348404, 57.552152]}
                zoom={10}
                style={{ height: '500px', width: '100%' }}
                className="rounded-lg shadow-md"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {properties.map((property) => (
                  <Marker
                    key={property._id}
                    position={[
                      property.address?.latitude || -20.348404,
                      property.address?.longitude || 57.552152,
                    ]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {property.address?.city}, {property.address?.country || 'Mauritius'}
                        </p>
                        <p className="text-teal-600 font-bold mb-3">
                          {property.price} {activeCurrency}
                        </p>
                        <Button
                          onClick={() => navigate(`/properties/${property._id}`)}
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="space-y-4">
              {properties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No properties found matching your criteria.
                </div>
              ) : (
                properties.map((property) => (
                  <div
                    key={property._id}
                    className={`p-4 rounded-lg shadow transition-all duration-200 hover:shadow-lg ${
                      property.subscription?.plan === 'platinum'
                        ? 'border-2 border-yellow-500 bg-yellow-50'
                        : property.subscription?.plan === 'elite'
                        ? 'border-2 border-amber-500 bg-amber-50'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={property.images?.[0]?.url || '/placeholder.jpg'}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-md"
                      />
                      {property.subscription?.plan === 'platinum' && (
                        <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      )}
                      {property.subscription?.plan === 'elite' && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                          Elite
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-bold mb-2">{property.title}</h3>
                      <p className="text-gray-600 mb-2">
                        {property.address?.city}, {property.address?.country || 'Mauritius'}
                      </p>
                      <p className="text-teal-600 font-bold text-xl mb-4">
                        {property.price} {activeCurrency}
                      </p>
                      <Button
                        onClick={() => navigate(`/properties/${property._id}`)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Properties;