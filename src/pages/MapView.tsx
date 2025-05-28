import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Bed, Bath, Square, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  price: number;
  currency: string;
  category: 'for-sale' | 'for-rent' | 'offices' | 'office-rent' | 'land';
  type: 'Apartment' | 'House' | 'Villa' | 'Office' | 'Land' | 'Commercial' | 'Building' | 'Other';
  address: Address;
  area: number;
  bedrooms: number;
  bathrooms: number;
  images: PropertyImage[];
  isPremium: boolean;
  isFeatured: boolean;
  rentalPeriod?: 'day' | 'month';
}

const MapView = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?status=approved`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
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
          throw new Error(t('failed_to_fetch_properties'));
        }
        const data = await response.json();
        setProperties(data.data || []);
      } catch (error) {
        toast({
          title: t('error'),
          description: t('failed_to_load_properties'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [toast, t, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{t('properties_map')}</h1>
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
                    {property.price.toLocaleString('en-US', {
                      style: 'currency',
                      currency: property.currency,
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
                    {t('view_details')}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MapView;