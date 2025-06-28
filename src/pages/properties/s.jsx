import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Share2, Loader2, Check, Star, ChevronLeft, ChevronRight, Heart, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { amenities } from '@/data/amenities';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'marker-icon.gif',
  iconUrl: '/marker-icon.gif',
  shadowUrl: '/marker-shadow.png',
});

interface Address {
  street?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  latitude?: string;
  longitude?: string;
}

interface PropertyImage {
  url: string;
  caption?: string;
  isMain: boolean;
  thumbnail?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  role?: string;
}

interface Agent {
  _id: string;
  user: User;
  title?: string;
  photoUrl?: string;
  isPremium?: boolean;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: User;
  createdAt: string;
}

interface AvailableDate {
  _id?: string;
  startDate: string;
  endDate: string;
  status: 'available' | 'booked' | 'unavailable';
}

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'EUR' | 'MUR';
  type: string;
  category: string;
  address: Address;
  location: {
    type: string;
    coordinates: [number, number];
  };
  area: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: PropertyImage[];
  virtualTourUrl?: string;
  videoUrl?: string;
  isFeatured: boolean;
  isPremium: boolean;
  status: 'pending' | 'approved' | 'rejected';
  owner: string;
  agent?: Agent;
  agency?: {
    _id: string;
    name: string;
    logoUrl: string;
  };
  availability: AvailableDate[];
  contactDetails?: {
    phone?: string;
    email?: string;
  };
  rentalPeriod?: 'day' | 'month';
  isFavorite?: boolean;
}

const PropertyDetails = () => {
  const { t } = useTranslation();
  const { id, category } = useParams();
  const navigate = useNavigate();
  const [agentData, setAgentData] = useState<Agent | null>(null);
  const { toast } = useToast();
  const [agencyAgents, setAgencyAgents] = useState<Agent[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const coordinates = useMemo(() => {
    if (!property) return null;
    
    if (property.location?.coordinates && Array.isArray(property.location.coordinates)) {
      const [lng, lat] = property.location.coordinates;
      if (typeof lng === 'number' && typeof lat === 'number' && 
          !isNaN(lng) && !isNaN(lat) && 
          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng] as [number, number];
      }
    }
    
    if (property.address?.latitude && property.address?.longitude) {
      const lat = parseFloat(property.address.latitude);
      const lng = parseFloat(property.address.longitude);
      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng] as [number, number];
      }
    }
    
    return [-20.348404, 57.552152] as [number, number];
  }, [property]);

  const MapComponent = () => {
    if (!coordinates) {
      return (
        <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
          <MapPin className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500">Location coordinates not available</p>
        </div>
      );
    }

    return (
      <MapContainer 
        center={coordinates} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={coordinates}>
          <Popup>
            <div className="text-center">
              <strong>{property?.title}</strong>
              <br />
              {property?.address.street && `${property.address.street}, `}
              {property?.address.city}, {property?.address.country || 'Mauritius'}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    );
  };

  useEffect(() => {
    if (property?.agency?._id) {
      const fetchAgencyAgents = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/agents?agency=${property.agency._id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }
          );
          const data = await response.json();
          setAgencyAgents(data.data || []);
        } catch (error) {
          console.error("Failed to fetch agency agents", error);
        }
      };
      fetchAgencyAgents();
    }
  }, [property]);

  useEffect(() => {
    if (property?.agent?._id) {
      const fetchAgent = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/agents/${property.agent._id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }
          );
          const data = await response.json();
          setAgentData(data.data);
        } catch (error) {
          console.error("Failed to fetch agent details", error);
        }
      };
      fetchAgent();
    }
  }, [property]);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser?._id) {
        setUser(storedUser);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const fetchProperty = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties/${category}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Property not found');
      }

      const data = await response.json();
      setProperty(data.data);
      
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(data.data._id));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load property',
        variant: 'destructive',
      });
      navigate('/properties');
    } finally {
      setIsLoading(false);
    }
  }, [id, category, navigate, toast]);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    fetchProperty();
  }, [fetchProperty]);

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((favId: string) => favId !== property?._id)
      : [...favorites, property?._id];

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);

    toast({
      title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      description: isFavorite ? 'Property removed from favorites' : 'Property added to favorites',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Property link copied to clipboard',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <Button onClick={() => navigate('/properties')}>Browse Properties</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>{property.title} | RealEstate</title>
        <meta name="description" content={property.description.substring(0, 160)} />
      </Helmet>

      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <BackButton onClick={() => navigate(-1)} className="mb-6" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="relative">
            <div className="h-96 overflow-hidden">
              {property.images.length > 0 ? (
                <img
                  src={property.images[selectedImageIndex].url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {property.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                  onClick={() => setSelectedImageIndex(
                    (selectedImageIndex - 1 + property.images.length) % property.images.length
                  )}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                  onClick={() => setSelectedImageIndex(
                    (selectedImageIndex + 1) % property.images.length
                  )}
                >
                  <ChevronRight />
                </Button>
              </>
            )}

            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {property.isPremium && (
                    <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                      Premium
                    </span>
                  )}
                  <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
                    {property.type}
                  </span>
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {property.category}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                
                <div className="flex items-center gap-1 text-gray-600 mb-4">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {property.address.street ? `${property.address.street}, ` : ''}
                    {property.address.city}, {property.address.country || 'Mauritius'}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-primary mb-1">
                  {property.currency === 'USD' ? '$' : property.currency === 'EUR' ? '€' : '₨'} 
                  {property.price.toLocaleString()}
                  {property.rentalPeriod && (
                    <span className="text-base font-normal">/{property.rentalPeriod}</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {property.area} m² • {property.bedrooms} beds • {property.bathrooms} baths
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 my-6 pt-6">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </div>
            
            <div className="border-t border-gray-200 my-6 pt-6">
              <h2 className="text-xl font-bold mb-4">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-medium">Property Type:</span>
                  <span>{property.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-medium">Bedrooms:</span>
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-medium">Bathrooms:</span>
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-medium">Area:</span>
                  <span>{property.area} m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-medium">Year Built:</span>
                  <span>2020</span>
                </div>
              </div>
            </div>
            
            {property.amenities && property.amenities.length > 0 && (
              <div className="border-t border-gray-200 my-6 pt-6">
                <h2 className="text-xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => {
                    const amenityData = amenities.find(a => a.name === amenity);
                    return (
                      <div key={index} className="flex items-center gap-3">
                        {amenityData && (
                          <img 
                            src={amenityData.icon} 
                            alt={amenity} 
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Fixed Map Section */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <div className="relative h-80 w-full rounded-xl overflow-hidden border bg-gray-100">
              <div className="absolute inset-0 z-10">
                <MapComponent />
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Contact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoggedIn ? (
                <>
                  {agentData || agencyAgents.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6">
                      {agentData ? (
                        <div className="flex items-center gap-4 mb-4">
                          <img 
                            src={agentData.photoUrl || '/default-avatar.jpg'}
                            alt={`${agentData.user.firstName} ${agentData.user.lastName}`}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-bold text-lg">
                              {agentData.user.firstName} {agentData.user.lastName}
                            </h3>
                            <p className="text-gray-600">{agentData.title || 'Real Estate Agent'}</p>
                            {property.agency?.name && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Building2 className="h-4 w-4" /> {property.agency.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 mb-4">
                          <img 
                            src={agencyAgents[0].photoUrl || '/default-avatar.jpg'}
                            alt={`${agencyAgents[0].user.firstName} ${agencyAgents[0].user.lastName}`}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-bold text-lg">
                              {agencyAgents[0].user.firstName} {agencyAgents[0].user.lastName}
                            </h3>
                            <p className="text-gray-600">{agencyAgents[0].title || 'Real Estate Agent'}</p>
                            {property.agency?.name && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Building2 className="h-4 w-4" /> {property.agency.name}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {agentData ? (
                          <>
                            {agentData.user?.phone && (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Phone className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">{agentData.user.phone}</span>
                              </div>
                            )}
                            {agentData.user?.email && (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Mail className="h-5 w-5 text-green-600" />
                                <span className="font-medium">{agentData.user.email}</span>
                              </div>
                            )}
                            <Button 
                              onClick={() => navigate(`/agent/${agentData._id}`)}
                              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              View More Details
                            </Button>
                          </>
                        ) : agencyAgents.length > 0 ? (
                          <>
                            {agencyAgents[0].user?.phone && (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Phone className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">{agencyAgents[0].user.phone}</span>
                              </div>
                            )}
                            {agencyAgents[0].user?.email && (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Mail className="h-5 w-5 text-green-600" />
                                <span className="font-medium">{agencyAgents[0].user.email}</span>
                              </div>
                            )}
                            <Button 
                              onClick={() => navigate(`/agent/${agencyAgents[0]._id}`)}
                              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              View More Details
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ) : 
                  property.agency ? (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        {property.agency.logoUrl && (
                          <img 
                            src={property.agency.logoUrl} 
                            alt={property.agency.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{property.agency.name}</h3>
                          <p className="text-gray-600">Real Estate Agency</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {property.contactDetails?.phone && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <Phone className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{property.contactDetails.phone}</span>
                          </div>
                        )}
                        {property.contactDetails?.email && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <Mail className="h-5 w-5 text-green-600" />
                            <span className="font-medium">{property.contactDetails.email}</span>
                          </div>
                        )}
                        <Button 
                          onClick={() => navigate(`/agency/${property.agency._id}`)}
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Agency Details
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium mb-2">Contact Property</h3>
                    <p className="text-gray-600">
                      Login to view contact details or send a message directly
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input id="phone" placeholder="+230 123 4567" />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="I'm interested in this property..." 
                        rows={4}
                      />
                    </div>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => toast({
                        title: "Message Sent",
                        description: "Your message has been sent to the property agent",
                      })}
                    >
                      Send Message
                    </Button>
                    
                    <div className="text-center mt-4">
                      <Button 
                        variant="link" 
                        className="text-blue-600"
                        onClick={() => navigate('/login')}
                      >
                        Already have an account? Login
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetails;