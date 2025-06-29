import { useState, useEffect, useCallback, useMemo, useRef} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Share2, Loader2, Check, Star, ChevronLeft, ChevronRight, Heart, Building2, Bed, Bath, Square, Calendar, Eye, Play, ExternalLink, MessageCircle, User, Shield, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { amenities } from '@/data/amenities';
import mauritiusDistricts from '@/data/mauritiusDistricts.json';
import mauritiusRegions from '@/data/mauritiusRegions.json';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'marker-icon.gif',
  iconUrl: '/marker-icon.gif',
  shadowUrl: '/marker-shadow.png',
});

const getGeoJsonForDistrict = (districtName: string) => {
  const feature = mauritiusDistricts.features.find(
    (f) => f.properties.name === districtName
  );
  if (!feature) return null;
  return {
    type: "FeatureCollection",
    features: [feature],
  };
};

const getGeoJsonForRegion = (regionName: string) => {
  const feature = mauritiusRegions.features.find(
    (f) => f.properties.name === regionName
  );
  if (!feature) return null;
  return {
    type: "FeatureCollection",
    features: [feature],
  };
};

const getRegionCenter = (regionName: string) => {
  const feature = mauritiusRegions.features.find(
    (f) => f.properties.name === regionName
  );
  if (!feature) return null;
  const coordinates = feature.geometry.coordinates[0];
  const lats = coordinates.map((coord) => coord[1]);
  const lngs = coordinates.map((coord) => coord[0]);
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  return [centerLat, centerLng];
};

const MapController = ({ showRegion, property }) => {
  const map = useMap();
  const regionLabelsRef = useRef(null);
  const geoJsonLayerRef = useRef(null);

  useEffect(() => {
    // Clean up existing layers
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }
    
    if (regionLabelsRef.current) {
      map.removeLayer(regionLabelsRef.current);
      regionLabelsRef.current = null;
    }

    if (showRegion && property?.address.region) {
      // Show specific region with boundary
      const geoJsonData = getGeoJsonForRegion(property.address.region);
      if (geoJsonData) {
        const geoJsonLayer = L.geoJSON(geoJsonData, {
          style: () => ({
            color: "#4f46e5",
            weight: 2,
            fillOpacity: 0.1,
            fillColor: "#4f46e5",
          }),
        });

        geoJsonLayer.addTo(map);
        geoJsonLayerRef.current = geoJsonLayer;
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
        
        // Add region labels for all regions
        const regionLabels = L.layerGroup().addTo(map);
        regionLabelsRef.current = regionLabels;
        
        const regionCenters = {
          "North": [-20.05, 57.55],
          "West": [-20.35, 57.35],
          "East": [-20.25, 57.75],
          "South": [-20.45, 57.55],
          "Central": [-20.30, 57.50]
        };
        
        Object.entries(regionCenters).forEach(([name, center]) => {
          L.marker(center, {
            icon: L.divIcon({
              className: 'region-label',
              html: `<div class="region-label-text">${name}</div>`,
              iconSize: [100, 40],
              iconAnchor: [50, 20]
            }),
            interactive: false
          }).addTo(regionLabels);
        });
      }
    } else if (showRegion) {
      // Show all regions view with labels
      const regionLabels = L.layerGroup().addTo(map);
      regionLabelsRef.current = regionLabels;
      
      const regionCenters = {
        "North": [-20.05, 57.55],
        "West": [-20.35, 57.35],
        "East": [-20.25, 57.75],
        "South": [-20.45, 57.55],
        "Central": [-20.30, 57.50]
      };
      
      Object.entries(regionCenters).forEach(([name, center]) => {
        L.marker(center, {
          icon: L.divIcon({
            className: 'region-label',
            html: `<div class="region-label-text">${name}</div>`,
            iconSize: [100, 40],
            iconAnchor: [50, 20]
          }),
          interactive: false
        }).addTo(regionLabels);
      });
      
      const mauritiusBounds = L.geoJSON(mauritiusRegions).getBounds();
      map.fitBounds(mauritiusBounds, { padding: [20, 20] });
    } else if (property?.address.city) {
      // Show district view
      const geoJsonData = getGeoJsonForDistrict(property.address.city);
      if (geoJsonData) {
        const geoJsonLayer = L.geoJSON(geoJsonData, {
          style: () => ({
            color: "#4f46e5",
            weight: 2,
            fillOpacity: 0.1,
            fillColor: "#4f46e5",
          }),
        });

        geoJsonLayer.addTo(map);
        geoJsonLayerRef.current = geoJsonLayer;
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
      }
    } else {
      // Default view with region labels
      const regionLabels = L.layerGroup().addTo(map);
      regionLabelsRef.current = regionLabels;
      
      const regionCenters = {
        "North": [-20.05, 57.55],
        "West": [-20.35, 57.35],
        "East": [-20.25, 57.75],
        "South": [-20.45, 57.55],
        "Central": [-20.30, 57.50]
      };
      
      Object.entries(regionCenters).forEach(([name, center]) => {
        L.marker(center, {
          icon: L.divIcon({
            className: 'region-label',
            html: `<div class="region-label-text">${name}</div>`,
            iconSize: [100, 40],
            iconAnchor: [50, 20]
          }),
          interactive: false
        }).addTo(regionLabels);
      });
      
      const mauritiusBounds = L.geoJSON(mauritiusRegions).getBounds();
      map.fitBounds(mauritiusBounds, { padding: [20, 20] });
    }

    return () => {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
      if (regionLabelsRef.current) {
        map.removeLayer(regionLabelsRef.current);
        regionLabelsRef.current = null;
      }
    };
  }, [showRegion, property, map]);

  return null;
};

interface Address {
  street?: string;
  city: string;
  region?: string;
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
  const [showAllImages, setShowAllImages] = useState(false);
  const [showRegion, setShowRegion] = useState(false);
  
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
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-xl">
          <MapPin className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Location coordinates not available</p>
        </div>
      );
    }

    return (
      <MapContainer 
        center={coordinates} 
        zoom={showRegion ? 10 : 14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        className="z-10 rounded-xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {coordinates && <Marker position={coordinates}>
          <Popup>
            <div className="text-center">
              <strong>{property?.title}</strong>
              <br />
              {property?.address.street && `${property.address.street}, `}
              {property?.address.city && `${property.address.city}, `}
              {property?.address.region && `${property.address.region} Region, `}
              {property?.address.country || 'Mauritius'}
            </div>
          </Popup>
        </Marker>}
        <MapController showRegion={showRegion} property={property} />
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading property details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/properties')} className="bg-blue-600 hover:bg-blue-700">
              Browse Properties
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Helmet>
        <title>{property.title} | RealEstate</title>
        <meta name="description" content={property.description.substring(0, 160)} />
      </Helmet>

      <Navbar />
      
      <div className="flex-grow">
        <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
          {property.images.length > 0 ? (
            <div className="relative h-full">
              <img
                src={property.images[selectedImageIndex].url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              
              {property.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
                    onClick={() => setSelectedImageIndex(
                      (selectedImageIndex - 1 + property.images.length) % property.images.length
                    )}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
                    onClick={() => setSelectedImageIndex(
                      (selectedImageIndex + 1) % property.images.length
                    )}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === selectedImageIndex ? 'bg-white w-6' : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleFavorite}
                  className="bg-white/90 hover:bg-white shadow-lg"
                >
                  <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleShare}
                  className="bg-white/90 hover:bg-white shadow-lg"
                >
                  <Share2 className="h-5 w-5 text-gray-700" />
                </Button>
                {property.virtualTourUrl && (
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => window.open(property.virtualTourUrl, '_blank')}
                    className="bg-white/90 hover:bg-white shadow-lg"
                  >
                    <Eye className="h-5 w-5 text-gray-700" />
                  </Button>
                )}
                {property.videoUrl && (
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => window.open(property.videoUrl, '_blank')}
                    className="bg-white/90 hover:bg-white shadow-lg"
                  >
                    <Play className="h-5 w-5 text-gray-700" />
                  </Button>
                )}
              </div>

              <div className="absolute top-4 left-4 z-10">
                <BackButton 
                  onClick={() => navigate(-1)} 
                  className="bg-white/90 hover:bg-white shadow-lg border-0"
                />
              </div>

              {property.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-10">
                  {selectedImageIndex + 1} / {property.images.length}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-8 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-lg p-6 lg:p-8"
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                    {property.type}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {property.category}
                  </Badge>
                  {property.isFeatured && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-gray-900">{property.title}</h1>
                
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="text-sm lg:text-base">
                    {property.address.street ? `${property.address.street}, ` : ''}
                    {property.address.city ? `${property.address.city}, ` : ''}
                    {property.address.region ? `${property.address.region} Region, ` : ''}
                    {property.address.country || 'Mauritius'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div>
                    <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-1">
                      {property.currency === 'USD' ? '$' : property.currency === 'EUR' ? '€' : '₨'} 
                      {property.price.toLocaleString()}
                      {property.rentalPeriod && (
                        <span className="text-lg font-normal text-gray-600">/{property.rentalPeriod}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Competitive market price</p>
                  </div>
                  
                  <div className="flex gap-4 lg:gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-700 font-semibold">
                        <Bed className="h-4 w-4 text-blue-600" />
                        {property.bedrooms}
                      </div>
                      <p className="text-xs text-gray-500">Bedrooms</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-700 font-semibold">
                        <Bath className="h-4 w-4 text-blue-600" />
                        {property.bathrooms}
                      </div>
                      <p className="text-xs text-gray-500">Bathrooms</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-700 font-semibold">
                        <Square className="h-4 w-4 text-blue-600" />
                        {property.area}
                      </div>
                      <p className="text-xs text-gray-500">m²</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 lg:p-8"
              >
                <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900">About This Property</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 lg:p-8"
              >
                <h2 className="text-xl lg:text-2xl font-bold mb-6 text-gray-900">Property Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Property Type', value: property.type, icon: Building2 },
                    { label: 'Bedrooms', value: property.bedrooms, icon: Bed },
                    { label: 'Bathrooms', value: property.bathrooms, icon: Bath },
                    { label: 'Floor Area', value: `${property.area} m²`, icon: Square },
                    { label: 'Year Built', value: '2020', icon: Calendar },
                    { label: 'Status', value: property.status, icon: Check },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{feature.label}</p>
                        <p className="font-semibold text-gray-900">{feature.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {property.amenities && property.amenities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg p-6 lg:p-8"
                >
                  <h2 className="text-xl lg:text-2xl font-bold mb-6 text-gray-900">Amenities & Features</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {property.amenities.map((amenity, index) => {
                      const amenityData = amenities.find(a => a.name === amenity);
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          {amenityData && (
                            <img 
                              src={amenityData.icon} 
                              alt={amenity} 
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-700">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6 lg:p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Location & Neighborhood</h2>
                 
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={!showRegion ? "default" : "outline"}
                      onClick={() => setShowRegion(false)}
                    >
                      District
                    </Button>
                    <Button 
                      variant={showRegion ? "default" : "outline"}
                      onClick={() => setShowRegion(true)}
                    >
                      Region
                    </Button>
                  </div>
                </div>
                <div className="h-80 w-full rounded-xl overflow-hidden border bg-gray-100 shadow-inner">
                  <style>
                    {`
                      .region-label-text {
                        font-weight: bold;
                        font-size: 16px;
                        color: #333;
                        text-shadow: 
                          1px 1px 0 #fff, 
                          -1px -1px 0 #fff, 
                          -1px 1px 0 #fff, 
                          1px -1px 0 #fff;
                        pointer-events: none;
                      }
                    `}
                  </style>
                  <MapComponent />
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    {showRegion 
                      ? `Located in ${property.address.region || 'Mauritius'} Region` 
                      : `Located in ${property.address.city}, ${property.address.country || 'Mauritius'}`}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="sticky top-8"
              >
                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Contact Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoggedIn ? (
                      <>
                        {agentData || agencyAgents.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img 
                                  src={(agentData?.photoUrl || agencyAgents[0]?.photoUrl) || '/default-avatar.jpg'}
                                  alt="Agent"
                                  className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100"
                                />
                                {(agentData?.isPremium || agencyAgents[0]?.isPremium) && (
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                    <Shield className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">
                                  {agentData ? 
                                    `${agentData.user.firstName} ${agentData.user.lastName}` :
                                    `${agencyAgents[0].user.firstName} ${agencyAgents[0].user.lastName}`
                                  }
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {(agentData?.title || agencyAgents[0]?.title) || 'Real Estate Agent'}
                                </p>
                                {property.agency?.name && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <Building2 className="h-3 w-3" /> {property.agency.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {(agentData?.user?.phone || agencyAgents[0]?.user?.phone) && (
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <Phone className="h-5 w-5 text-blue-600" />
                                  <span className="font-medium text-gray-900">
                                    {agentData?.user?.phone || agencyAgents[0]?.user?.phone}
                                  </span>
                                </div>
                              )}
                              {(agentData?.user?.email || agencyAgents[0]?.user?.email) && (
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                  <Mail className="h-5 w-5 text-green-600" />
                                  <span className="font-medium text-gray-900 text-sm break-all">
                                    {agentData?.user?.email || agencyAgents[0]?.user?.email}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Button 
                                onClick={() => navigate(`/agent/${agentData?._id || agencyAgents[0]?._id}`)}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                              >
                                <User className="h-4 w-4 mr-2" />
                                View Agent Profile
                              </Button>
                              <Button 
                                variant="outline"
                                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Send Message
                              </Button>
                            </div>
                          </div>
                        ) : 
                        property.agency ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              {property.agency.logoUrl && (
                                <img 
                                  src={property.agency.logoUrl} 
                                  alt={property.agency.name}
                                  className="w-16 h-16 rounded-lg object-cover ring-2 ring-blue-100"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">{property.agency.name}</h3>
                                <p className="text-gray-600 text-sm">Real Estate Agency</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {property.contactDetails?.phone && (
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <Phone className="h-5 w-5 text-blue-600" />
                                  <span className="font-medium text-gray-900">{property.contactDetails.phone}</span>
                                </div>
                              )}
                              {property.contactDetails?.email && (
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                  <Mail className="h-5 w-5 text-green-600" />
                                  <span className="font-medium text-gray-900 text-sm break-all">{property.contactDetails.email}</span>
                                </div>
                              )}
                            </div>

                            <Button 
                              onClick={() => navigate(`/agency/${property.agency._id}`)}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                            >
                              <Building2 className="h-4 w-4 mr-2" />
                              View Agency Profile
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No agent information available</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center mb-6">
                          <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold mb-2 text-gray-900">Get In Touch</h3>
                          <p className="text-gray-600 text-sm">
                            Send a message to inquire about this property
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Your Name</Label>
                            <Input 
                              id="name" 
                              placeholder="John Doe" 
                              className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="you@example.com" 
                              className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number (Optional)</Label>
                            <Input 
                              id="phone" 
                              placeholder="+230 123 4567" 
                              className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                            <Textarea 
                              id="message" 
                              placeholder="I'm interested in this property. Could you provide more information?" 
                              rows={4}
                              className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                            onClick={() => toast({
                              title: "Message Sent Successfully",
                              description: "Your inquiry has been sent to the property agent. They will contact you soon.",
                            })}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Inquiry
                          </Button>
                          
                          <Separator className="my-4" />
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
                            <Button 
                              variant="outline" 
                              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                              onClick={() => navigate('/login')}
                            >
                              Login to View Contact Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {property.images.length > 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl lg:text-2xl">Property Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {property.images.slice(0, 8).map((image, index) => (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img 
                          src={image.thumbnail || image.url}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                    {property.images.length > 8 && (
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-600">+{property.images.length - 8}</p>
                          <p className="text-sm text-gray-500">More Photos</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PropertyDetails;