import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Bed, Bath, Square, Home } from 'lucide-react';

// Interfaces
interface Address {
  street?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
}

interface PropertyImage {
  url: string;
  caption?: string;
  isMain: boolean;
  thumbnail?: string;
}

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: 'Apartment' | 'House' | 'Villa' | 'Office' | 'Land' | 'Commercial' | 'Building' | 'Other';
  category: 'for-sale' | 'for-rent' | 'offices' | 'office-rent' | 'land';
  address: Address;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  area: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: PropertyImage[];
  isPremium: boolean;
  isFeatured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  owner: string;
  rentalPeriod?: 'day' | 'month';
  isFavorite?: boolean;
}

interface Filters {
  category: string;
  type: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  minArea: string;
  amenities: string[];
  search: string;
}

// Currency conversion rates (mock rates, replace with API if needed)
const currencyRates: Record<string, Record<string, number>> = {
  MUR: { USD: 0.021, EUR: 0.01952, MUR: 1 },
  USD: { MUR: 47.62, EUR: 0.90, USD: 1 },
  EUR: { MUR: 51.23, USD: 1.11, EUR: 1 },
};

// Utility to convert price
const convertPrice = (price: number, currencyFrom: string, currencyTo: string) => {
  if (currencyFrom === currencyTo) return price;
  const rate = currencyRates[currencyFrom]?.[currencyTo];
  if (!rate) {
    console.warn(`No conversion rate found for ${currencyFrom} to ${currencyTo}`);
    return price;
  }
  return Math.round(rate * price);
};

const Properties = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<Filters>({
    category: '',
    type: '',
    maxPrice: '',
    minBeds: '',
    minBaths: '',
    minArea: '',
    amenities: [],
    search: '',
  });
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [activeCurrency, setActiveCurrency] = useState('MUR');
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('status', 'approved');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, v));
          } else {
            queryParams.set(key, String(value));
          }
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: t('Error'),
            description: t('Session expired'),
            variant: 'destructive',
          });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('failed_to_fetch_properties'));
      }

      const data = await response.json();
      setProperties(data.data || []);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      toast({
        title: t('error'),
        description: error.message || t('failed_to_load_properties'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast, t, navigate]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchProperties();
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [filters, fetchProperties]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenity = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a: string) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleReset = () => {
    setFilters({
      category: '',
      type: '',
      maxPrice: '',
      minBeds: '',
      minBaths: '',
      minArea: '',
      amenities: [],
      search: '',
    });
    toast({
      title: t('Filters Reset'),
      description: t('Filters cleared'),
      variant: 'default',
    });
  };

  const availableAmenities = [
    'Pool',
    'Garage',
    'Garden',
    'Balcony',
    'Air Conditioning',
    'Terrace',
    'Parking',
    'Gym',
    'Security',
    'Internet',
  ];

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
          <h1 className="text-3xl font-bold mb-6">
            <Search className="inline h-8 w-8" /> {t('Find Properties')}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              name="search"
              type="text"
              placeholder={t('Search by title or city')}
              value={filters.search}
              onChange={handleFilterChange}
            />
            <Input
              name="maxPrice"
              type="number"
              placeholder={t('Max Price')}
              value={filters.maxPrice}
              onChange={handleFilterChange}
              min="0"
            />
            <Select
              value={filters.category}
              onValueChange={(value) => handleSelect('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Categories')}</SelectItem>
                <SelectItem value="for-sale">{t('For Sale')}</SelectItem>
                <SelectItem value="for-rent">{t('For Rent')}</SelectItem>
                <SelectItem value="offices">{t('Offices')}</SelectItem>
                <SelectItem value="office-rent">{t('Office Rent')}</SelectItem>
                <SelectItem value="land">{t('Land')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => handleSelect('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Types')}</SelectItem>
                <SelectItem value="Apartment">{t('Apartment')}</SelectItem>
                <SelectItem value="House">{t('House')}</SelectItem>
                <SelectItem value="Villa">{t('Villa')}</SelectItem>
                <SelectItem value="Office">{t('Office')}</SelectItem>
                <SelectItem value="Land">{t('Land')}</SelectItem>
                <SelectItem value="Commercial">{t('Commercial')}</SelectItem>
                <SelectItem value="Building">{t('Building')}</SelectItem>
                <SelectItem value="Other">{t('Other')}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              name="minArea"
              type="number"
              placeholder={t('Min Area (sqm)')}
              value={filters.minArea}
              onChange={handleFilterChange}
              min="0"
            />
            <Input
              name="minBeds"
              type="number"
              placeholder={t('Min Beds')}
              value={filters.minBeds}
              onChange={handleFilterChange}
              min="0"
            />
            <Input
              name="minBaths"
              type="number"
              placeholder={t('Min Baths')}
              value={filters.minBaths}
              onChange={handleFilterChange}
              min="0"
            />
            <Button variant="outline" onClick={handleReset}>
              {t('Reset Filters')}
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">{t('Amenities')}</h3>
            <div className="flex flex-wrap gap-2">
              {availableAmenities.map((amenity) => (
                <Button
                  key={amenity}
                  variant={filters.amenities.includes(amenity) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAmenity(amenity)}
                >
                  {t(amenity.toLowerCase().replace(/\s+/g, '_'))}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <Filter className="inline h-5 w-5" />{' '}
            {t('Properties found', { count: properties.length })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 shadow rounded-lg bg-white">
                <Skeleton className="w-full h-48" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
                <Skeleton className="h-4 w-1/3 mt-2" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.length === 0 ? (
              <div className="text-center py-8 text-gray-500 col-span-full">
                {t('No properties found')}
              </div>
            ) : (
              properties.map((property) => (
                <div
                  key={property._id}
                  className={`p-4 rounded-lg shadow ${
                    property.isFeatured
                      ? 'border-2 border-yellow-500 bg-yellow-50'
                      : property.isPremium
                      ? 'border-2 border-amber-500 bg-amber-50'
                      : 'bg-white'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={property.images?.find((img) => img.isMain)?.url || '/placeholder.jpg'}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                    {property.isFeatured && (
                      <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                        {t('Featured')}
                      </span>
                    )}
                    {property.isPremium && !property.isFeatured && (
                      <span className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-sm">
                        {t('Premium')}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold">{property.title}</h3>
                    <p className="text-gray-600">
                      {property.address.street ? `${property.address.street}, ` : ''}
                      {property.address.city}, {property.address.country}
                    </p>
                    <p className="text-teal-600 font-bold text-xl">
                      {convertPrice(
                        property.price,
                        property.currency,
                        activeCurrency
                      ).toLocaleString('en-US', {
                        style: 'currency',
                        currency: activeCurrency,
                      })}
                      {property.rentalPeriod ? ` / ${t(property.rentalPeriod)}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {property.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" /> {property.bedrooms} {t('beds')}
                        </span>
                      )}
                      {property.bathrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" /> {property.bathrooms} {t('baths')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Square className="h-4 w-4" /> {property.area} m²
                      </span>
                      <span className="flex items-center gap-1">
                        <Home className="h-4 w-4" /> {t(property.type.toLowerCase())}
                      </span>
                    </div>
                    <Button
                      onClick={() => navigate(`/properties/${property.category.replace(/\s+/g, '-')}/${property._id}`)}
                      className="w-full mt-4"
                    >
                      {t('View Details')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Properties;