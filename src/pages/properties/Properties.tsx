import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Interfaces for type safety
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
  currency: 'USD' | 'EUR' | 'MUR';
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
  search?: string;
}

// Currency conversion rates (mock rates, replace with API if needed)
const currencyRates: Record<string, Record<string, number>> = {
  MUR: { USD: 0.021, EUR: 0.019, MUR: 1 },
  USD: { MUR: 47.62, EUR: 0.90, USD: 1 },
  EUR: { MUR: 52.63, USD: 1.11, EUR: 1 },
};

// Utility to convert price
const convertPrice = (price: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return price;
  const rate = currencyRates[fromCurrency]?.[toCurrency];
  if (!rate) {
    console.warn(`No conversion rate found for ${fromCurrency} to ${toCurrency}`);
    return price; // Fallback to original price
  }
  return Math.round(price * rate);
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
  const mapRef = useRef<L.Map | null>(null);

  // Fetch properties with debounced filters
  const fetchProperties = useCallback(
    async (currentFilters: Filters) => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('status', 'approved');
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
            if (Array.isArray(value)) {
              value.forEach((v) => queryParams.append(key, v));
            } else {
              queryParams.set(key, value.toString());
            }
          }
        });

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/properties?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: t('error'),
              description: t('session_expired'),
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

        // Adjust map bounds to fit properties
        if (mapRef.current && data.data?.length > 0) {
          const bounds = L.latLngBounds(
            data.data
              .filter((p: Property) => p.location?.coordinates)
              .map((p: Property) => [
                p.location.coordinates[1],
                p.location.coordinates[0],
              ] as LatLngExpression)
          );
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
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
    },
    [toast, navigate, t]
  );

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchProperties(filters);
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [filters, fetchProperties]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAmenityToggle = useCallback((amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
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
    toast({ title: t('filters_reset'), description: t('filters_cleared') });
  }, [toast, t]);

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
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12" id="main-content">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2" aria-label={t('find_properties')}>
            <Search className="h-8 w-8" />
            {t('find_properties')}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              name="search"
              type="text"
              placeholder={t('search_by_title_city')}
              value={filters.search}
              onChange={handleFilterChange}
              aria-label={t('search_by_title_city')}
            />
            <Input
              name="maxPrice"
              type="number"
              placeholder={t('max_price')}
              value={filters.maxPrice}
              onChange={handleFilterChange}
              min="0"
              aria-label={t('max_price')}
            />
            <Select
              value={filters.category}
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger aria-label={t('category')}>
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('all_categories')}</SelectItem>
                <SelectItem value="for-sale">{t('for_sale')}</SelectItem>
                <SelectItem value="for-rent">{t('for_rent')}</SelectItem>
                <SelectItem value="offices">{t('offices')}</SelectItem>
                <SelectItem value="office-rent">{t('office_rent')}</SelectItem>
                <SelectItem value="land">{t('land')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger aria-label={t('type')}>
                <SelectValue placeholder={t('type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('all_types')}</SelectItem>
                <SelectItem value="Apartment">{t('apartment')}</SelectItem>
                <SelectItem value="House">{t('house')}</SelectItem>
                <SelectItem value="Villa">{t('villa')}</SelectItem>
                <SelectItem value="Office">{t('office')}</SelectItem>
                <SelectItem value="Land">{t('land')}</SelectItem>
                <SelectItem value="Commercial">{t('commercial')}</SelectItem>
                <SelectItem value="Building">{t('building')}</SelectItem>
                <SelectItem value="Other">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              name="minArea"
              type="number"
              placeholder={t('min_area_sqm')}
              value={filters.minArea}
              onChange={handleFilterChange}
              min="0"
              aria-label={t('min_area_sqm')}
            />
            <Input
              name="minBeds"
              type="number"
              placeholder={t('min_beds')}
              value={filters.minBeds}
              onChange={handleFilterChange}
              min="0"
              aria-label={t('min_beds')}
            />
            <Input
              name="minBaths"
              type="number"
              placeholder={t('min_baths')}
              value={filters.minBaths}
              onChange={handleFilterChange}
              min="0"
              aria-label={t('min_baths')}
            />
            <Button
              variant="outline"
              onClick={handleResetFilters}
              aria-label={t('reset_filters')}
              className="w-full"
            >
              {t('reset_filters')}
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">{t('amenities')}</h3>
            <div className="flex flex-wrap gap-2">
              {availableAmenities.map((amenity) => (
                <Button
                  key={amenity}
                  variant={filters.amenities.includes(amenity) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAmenityToggle(amenity)}
                  aria-pressed={filters.amenities.includes(amenity)}
                  aria-label={t(amenity.toLowerCase())}
                >
                  {t(amenity.toLowerCase().replace(/\s+/g, '_'))}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className="text-sm text-gray-600">
              {t('properties_found', { count: properties.length })}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg shadow bg-white">
                  <Skeleton className="w-full h-48 rounded-md" />
                  <Skeleton className="h-6 w-3/4 mt-4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MapContainer
                center={[-20.348404, 57.552152] as LatLngExpression}
                zoom={10}
                style={{ height: '500px', width: '100%' }}
                className="rounded-lg shadow-md z-0"
                aria-label={t('properties_map')}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MarkerClusterGroup
                  maxClusterRadius={40}
                  disableClusteringAtZoom={15}
                >
                  {properties
                    .filter((property) => property.location?.coordinates)
                    .map((property) => (
                      <Marker
                        key={property._id}
                        position={
                          [
                            property.location.coordinates[1],
                            property.location.coordinates[0],
                          ] as LatLngExpression
                        }
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {property.address.city}, {property.address.country}
                            </p>
                            <p className="text-teal-600 font-bold mb-3">
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
                            <Button
                              onClick={() => navigate(`/properties/${property._id}`)}
                              size="sm"
                              aria-label={t('view_details_for', { title: property.title })}
                            >
                              {t('view_details')}
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MarkerClusterGroup>
              </MapContainer>
            </div>

            <div className="space-y-4">
              {properties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('no_properties_found')}
                </div>
              ) : (
                properties.map((property) => (
                  <div
                    key={property._id}
                    className={`p-4 rounded-lg shadow transition-all duration-200 hover:shadow-lg ${
                      property.isFeatured
                        ? 'border-2 border-yellow-500 bg-yellow-50'
                        : property.isPremium
                        ? 'border-2 border-amber-500 bg-amber-50'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    role="article"
                    aria-labelledby={`property-title-${property._id}`}
                  >
                    <div className="relative">
                      <img
                        src={
                          property.images?.find((img) => img.isMain)?.url ||
                          '/placeholder.jpg'
                        }
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-md"
                        loading="lazy"
                      />
                      {property.isFeatured && (
                        <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                          {t('featured')}
                        </span>
                      )}
                      {property.isPremium && !property.isFeatured && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                          {t('premium')}
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <h3
                        id={`property-title-${property._id}`}
                        className="text-lg font-bold mb-2"
                      >
                        {property.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {property.address.street ? `${property.address.street}, ` : ''}
                        {property.address.city}, {property.address.country}
                      </p>
                      <p className="text-teal-600 font-bold text-xl mb-2">
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
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        {property.bedrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" /> {property.bedrooms}{' '}
                            {t('beds')}
                          </span>
                        )}
                        {property.bathrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath className="h-4 w-4" /> {property.bathrooms}{' '}
                            {t('baths')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Square className="h-4 w-4" /> {property.area} m²
                        </span>
                        <span className="flex items-center gap-1">
                          <Home className="h-4 w-4" />{' '}
                          {t(property.type.toLowerCase())}
                        </span>
                      </div>
                      <Button
                        onClick={() => navigate(`/properties/${property._id}`)}
                        className="w-full"
                        aria-label={t('view_details_for', { title: property.title })}
                      >
                        {t('view_details')}
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