import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Share2, Loader2, Star, ChevronLeft, ChevronRight, Heart, Building2 } from 'lucide-react';
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
// Leaflet imports
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Interfaces for type safety
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
  avatar?: string;
}

interface Agent {
  _id: string;
  user: User;
  title?: string;
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
  availability: AvailableDate[];
  contactDetails?: {
    phone?: string;
    email?: string;
  };
  rentalPeriod?: 'day' | 'month';
  isFavorite?: boolean;
}

// Mock components for missing components
const AvailabilityForm = ({ propertyId, onSuccess }) => (
  <div className="p-2 border rounded">
    <p className="text-sm text-gray-600">Availability form would go here</p>
  </div>
);

const InquiryForm = ({ propertyId, agentId, user }) => (
  <div className="p-2 border rounded">
    <p className="text-sm text-gray-600">Inquiry form would go here</p>
  </div>
);

const PropertyDetails = () => {
  const { t } = useTranslation();
  const { id, category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState(null);
  
  // Add marker position state
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  // Load user from localStorage
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

  // Set marker position when property data is loaded
  useEffect(() => {
    if (property && property.address.latitude && property.address.longitude) {
      setMarkerPosition([
        parseFloat(property.address.latitude),
        parseFloat(property.address.longitude)
      ]);
    }
  }, [property]);

  // Fix leaflet default icon
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: '/marker-icon.png',
      iconRetinaUrl: '/marker-icon-2x.png',
      shadowUrl: '/marker-shadow.png',
    });
  }, []);

const fetchProperty = useCallback(async () => {
  setIsLoading(true);
  try {
    // Keep the category as-is from URL params (it should already be hyphenated)
    // Don't convert hyphens to spaces - the backend expects hyphenated format
    const categoryParam = category || 'for-sale';
    
    // Make sure the category is properly formatted (hyphenated, not spaced)
    const formattedCategory = categoryParam.replace(/\s+/g, '-').toLowerCase();
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/properties/${formattedCategory}/${id}`,
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
      throw new Error(errorData.message || t('failed_to_fetch_property'));
    }

    const data = await response.json();
    setProperty(data.data);
    setIsFavorite(data.data.isFavorite || false);

    // Fetch reviews
    const reviewsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/api/reviews/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      }
    );
    if (reviewsResponse.ok) {
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData.data || []);
    } else {
      console.warn('Failed to fetch reviews');
    }
  } catch (error) {
    console.error('Error fetching property:', error);
    toast({
      title: t('error'),
      description: error.message || t('failed_to_load_property'),
      variant: 'destructive',
    });
    navigate('/properties');
  } finally {
    setIsLoading(false);
  }
}, [id, category, toast, navigate, t]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: property?.title,
      text: t('check_out_property', {
        title: property?.title,
        city: property?.address?.city,
        country: property?.address?.country || 'Mauritius',
      }),
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: t('Link Copied'),
          description: t('URL copied to clipboard'),
          variant: 'default',
        });
      }
    } catch (err) {
      console.error('Error sharing property:', err);
      toast({
        title: t('error'),
        description: t('failed_to_share'),
        variant: 'destructive',
      });
    }
  }, [property, t, toast]);

  const handleFavoriteToggle = useCallback(async () => {
    if (!user?._id) {
      toast({
        title: t('login_required'),
        description: t('please_login_to_favorite'),
        variant: 'default',
      });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/favorites`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ propertyId: id }),
        });

      if (!response.ok) {
        throw new Error(t(isFavorite ? 'failed_to_remove_favorite' : 'failed_to_add_favorite'));
      }

      const data = await response.json();
      setIsFavorite(data.data.isFavorite);
      toast({
        title: t('success'),
        description: t(data.data.isFavorite ? 'added_to_favorites' : 'removed_from_favorites'),
        variant: 'default',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: t('error'),
        description: error.message || t('failed_to_toggle_favorite'),
        variant: 'destructive',
      });
    }
  }, [user, id, isFavorite, toast, t, navigate]);

  const handleReviewSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user?._id) {
        toast({
          title: t('login_required'),
          description: t('please_login_to_review'),
        });
        navigate('/login');
        return;
      }

      if (reviewForm.rating < 1 || reviewForm.rating > 5) {
        toast({
          title: t('error'),
          description: t('rating_must_be_valid'),
          variant: 'destructive',
        });
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reviews`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ propertyId: id, ...reviewForm }),
          });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || t('failed_to_submit_review'));
        }

        const data = await response.json();
        setReviews((prev) => [...prev, data.data]);
        setReviewForm({ rating: 5, comment: '' });
        toast({ title: t('Success'), description: t('Review Submitted') });
      } catch (error) {
        console.error('Error submitting review:', error);
        toast({
          title: t('error'),
          description: error.message || t('failed_to_submit_review'),
          variant: 'destructive',
        });
      }
    },
    [user, id, reviewForm, toast, t, navigate]
  );

  const handleImageNavigation = useCallback((direction) => {
    if (!property?.images) return;
    const totalImages = property.images.length;
    setSelectedImageIndex((prev) => {
      if (direction === 'prev') {
        return prev === 0 ? totalImages - 1 : prev - 1;
      }
      return prev === totalImages - 1 ? 0 : prev + 1;
    });
  }, [property?.images]);

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setSelectedImageIndex(index);
    }
  };

  const averageRating = useMemo(
    () => (reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0),
    [reviews]
  );

  const isRental = useMemo(
    () => ['for-rent', 'office-rent'].includes(property?.category || ''),
    [property?.category]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" aria-label={t('loading')} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div>
            <p className="text-gray-500">{t('property_not_found')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>{property.title} - Real Estate Platform</title>
        <meta name="description" content={property.description.substring(0, 160)} />
        <meta property="og:title" content={property.title} />
        <meta property="og:description" content={property.description.substring(0, 160)} />
        <meta property="og:image" content={property.images[0]?.url || '/default-image.jpg'} />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6" tabIndex={-1} id="main-content">
        <BackButton to="/properties" label={t('back_to_properties')} className="mb-6" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${
            property.isFeatured ? 'border-2 border-yellow-500 bg-yellow-50 p-4 rounded-lg' : ''
          }`}
        >
          <div className="lg:col-span-2">
            <div className="relative mb-6">
              <img
                src={property.images[selectedImageIndex]?.url || '/placeholder.jpg'}
                srcSet={
                  property.images[selectedImageIndex]?.thumbnail
                    ? `${property.images[selectedImageIndex].thumbnail} 500w, ${property.images[selectedImageIndex].url} 800w`
                    : undefined
                }
                sizes="(max-width: 768px) 100vw, 800px"
                alt={t('property_image_alt', { title: property.title })}
                className="w-full h-96 object-cover rounded-xl"
              />
              {property.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 left-2"
                    onClick={() => handleImageNavigation('prev')}
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleImageNavigation('next')}
                    aria-label="Next Image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  onClick={handleShare}
                  variant="secondary"
                  aria-label="Share Property"
                  className="bg-white/80"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('share')}
                </Button>
                <Button
                  onClick={handleFavoriteToggle}
                  variant={isFavorite ? 'destructive' : 'outline'}
                  size="icon"
                  aria-label={t('favorite')}
                  className={isFavorite ? '' : 'bg-white/80'}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
              {property.isFeatured && (
                <span className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                  {t('featured')}
                </span>
              )}
              {property.isPremium && !property.isFeatured && (
                <span className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm">
                  {t('premium')}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {property.images.map((image, index) => (
                <img
                  key={index}
                  src={image.thumbnail || image.url}
                  alt={`${t('property_image')} ${index + 1}`}
                  className={`w-full h-24 object-cover rounded-md cursor-pointer ${
                    index === selectedImageIndex ? 'border-2 border-teal-500' : 'border-0'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  tabIndex={0}
                />
              ))}
            </div>

            {/* Location Map Section */}
            <div className="mb-6">
              <Label className="text-lg font-bold mb-4 block">{t('location')}</Label>
              <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
                <MapContainer 
                  center={markerPosition || [-20.2, 57.5]} 
                  zoom={markerPosition ? 15 : 10} 
                  className="h-full w-full"
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {markerPosition && (
                    <Marker position={markerPosition}>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              {!markerPosition && (
                <p className="text-sm text-gray-500 mt-2">
                  {t('location_coordinates_not_available')}
                </p>
              )}
            </div>

            {(property.virtualTourUrl || property.videoUrl) && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2">{t('virtual_tour')}</h3>
                {property.videoUrl && (
                  <video
                    src={property.videoUrl}
                    controls
                    className="w-full h-64 rounded-lg mb-4"
                    aria-label="Property Video"
                  >
                    <track kind="captions" />
                  </video>
                )}
                {property.virtualTourUrl && (
                  <iframe
                    src={property.virtualTourUrl}
                    className="w-full h-64 rounded-lg"
                    title={t('virtual_tour')}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    aria-label="Virtual Tour"
                  />
                )}
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">{t('reviews')}</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500">{t('no_reviews')}</p>
              ) : (
                <>
                  <p className="text-sm mb-2" aria-label="Average Rating">
                    {t('average_rating')}: {averageRating.toFixed(1)} / 5 ({reviews.length}{' '}
                    {t(reviews.length === 1 ? 'review' : 'reviews')})
                  </p>
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b py-2">
                      <div className="flex items-center gap-2" aria-label={`${review.rating} ${t('stars')}`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm">{review.rating}/5</span>
                      </div>
                      <p className="mt-1">{review.comment}</p>
                      <p className="text-sm text-gray-500">
                        {t('by')} {review.user?.firstName} {review.user?.lastName} {t('on')}{' '}
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </>
              )}
              {user?._id && (
                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4" aria-label={t('review_form')}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="rating">
                      {t('rating')}
                    </label>
                    <div className="flex items-center gap-1" role="radiogroup" aria-labelledby="rating-label">
                      <span id="rating-label" className="sr-only">{t('rating')}</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                          onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                          onKeyDown={(e) => e.key === 'Enter' && setReviewForm((prev) => ({ ...prev, rating: star }))}
                          tabIndex={0}
                          aria-checked={star === reviewForm.rating}
                          role="radio"
                        />
                      ))}
                    </div>
                    <p id="rating-help" className="text-sm text-gray-500">
                      {t('rating_help')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="comment">
                      {t('comment')}
                    </label>
                    <Textarea
                      id="comment"
                      name="comment"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      className="w-full"
                      rows={4}
                      required
                      maxLength={1000}
                      aria-describedby="comment-help"
                    />
                    <p id="comment-help" className="text-sm text-gray-500">
                      {t('comment_help')}
                    </p>
                  </div>
                  <Button type="submit" aria-label={t('submit_review')}>
                    {t('submit_review')}
                  </Button>
                </form>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{property.title}</h1>
            <p className="text-sm text-slate-500 mb-4 capitalize">{t(property.status)}</p>
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <MapPin className="h-5 w-5" />
              <p>
                {property.address.street ? `${property.address.street}, ` : ''}
                {property.address.city}, {property.address.country}
              </p>
            </div>
            <p className="text-slate-600 mb-4">{property.description}</p>
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">{t('property_details')}</h3>
              <p className="text-sm">
                <strong>{t('price')}:</strong>{' '}
                {property.price.toLocaleString('en-US', { style: 'currency', currency: property.currency })}
                {isRental && property.rentalPeriod ? ` / ${t(property.rentalPeriod)}` : ''}
              </p>
              <p className="text-sm">
                <strong>{t('category')}:</strong> {t(property.category.replace('-', '_'))}
              </p>
              <p className="text-sm">
                <strong>{t('type')}:</strong> {t(property.type.toLowerCase())}
              </p>
              {property.bedrooms > 0 && (
                <p className="text-sm">
                  <strong>{property.bedrooms}</strong> {t('bedrooms')}
                </p>
              )}
              {property.bathrooms > 0 && (
                <p className="text-sm">
                  <strong>{property.bathrooms}</strong> {t('bathrooms')}
                </p>
              )}
              <p className="text-sm">
                <strong>{t('area')}:</strong> {property.area} m²
              </p>
            </div>
            {property.amenities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">{t('amenities')}</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded"
                      aria-label={t(amenity.toLowerCase().replace(/\s+/g, '_'))}
                    >
                      {t(amenity.toLowerCase().replace(/\s+/g, '_'))}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {isRental && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">{t('availability')}</h3>
                <Calendar
                  mode="range"
                  disabled={(date) =>
                    !property.availability.some(
                      (a) =>
                        date >= new Date(a.startDate) &&
                        date <= new Date(a.endDate) &&
                        a.status === 'available'
                    )
                  }
                  className="w-full"
                  aria-label={t('availability_calendar')}
                />
                {user?._id && property.owner === user._id && (
                  <div className="mt-4">
                    <AvailabilityForm
                      propertyId={id}
                      onSuccess={(newAvailability) => {
                        setProperty((prev) =>
                          prev
                            ? {
                                ...prev,
                                availability: [...prev.availability, newAvailability],
                              }
                            : prev
                        );
                        toast({
                          title: t('success'),
                          description: t('availability_added'),
                          variant: 'default',
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold mb-2">{t('contact_agent')}</h3>
              <div className="flex items-center gap-4">
                <img
                  src={property.agent?.user?.avatar || '/defaultAvatar.jpg'}
                  alt={t('agent_avatar', {
                    name: `${property.agent?.user?.firstName || ''} ${property.agent?.user?.lastName || ''}`,
                  })}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="font-bold">
                    {property.agent?.user?.firstName || 'N/A'} {property.agent?.user?.lastName || ''}
                    {property.agent?.isPremium && (
                      <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-1 rounded">
                        {t('premium')}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">{t('real_estate_agent')}</p>
                  {user?._id ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        <p>{property.contactDetails?.phone || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <p>{property.contactDetails?.email || 'N/A'}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      <a href="/login" className="text-blue-600 hover:underline" aria-label={t('log_in')}>
                        {t('log_in')}
                      </a>{' '}
                      {t('to_view_contact')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">{t('send_inquiry')}</h3>
              <InquiryForm propertyId={id} agentId={property.agent?._id} user={user} />
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetails;