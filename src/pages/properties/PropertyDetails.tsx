import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Share2, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackButton from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import AvailabilityForm from '@/components/AvailabilityForm';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch property');
        }

        const data = await response.json();
        setProperty(data.data);

        const reviewsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData.data || []);
        }

        const availabilityResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/availability/${id}`);
        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json();
          setAvailability(availabilityData.data || []);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load property details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, toast]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} in ${property.address?.city}, ${property.address?.country || 'Mauritius'}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Link Copied', description: 'Property URL copied to clipboard' });
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast({
        title: 'Error',
        description: 'Failed to share property',
        variant: 'destructive',
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId: id, ...reviewForm }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const data = await response.json();
      setReviews([...reviews, data.data]);
      setReviewForm({ rating: 5, comment: '' });
      toast({ title: 'Success', description: 'Review submitted successfully' });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
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
          <p className="text-gray-500">Property not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <BackButton to="/properties" label="Back to Properties" className="mb-6" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${property.isFeatured ? 'border-2 border-yellow-500 bg-yellow-50 p-4 rounded-lg' : ''}`}
        >
          <div className="lg:col-span-2">
            <div className="relative mb-6">
              <img
                src={selectedImage || property.images?.[0]?.url || '/placeholder.jpg'}
                alt={property.title}
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4">
                <Button onClick={handleShare} variant="secondary">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
              {property.isFeatured && (
                <span className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                  Featured
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {property.images?.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={img.caption || `Property image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedImage(img.url)}
                />
              ))}
            </div>
            {property.virtualTour && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2">Virtual Tour</h3>
                <iframe
                  src={property.virtualTour}
                  className="w-full h-64 rounded-lg"
                  title="Virtual Tour"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Reviews</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="border-b py-2">
                    <div className="flex items-center gap-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                      <span className="text-sm">{review.rating}/5</span>
                    </div>
                    <p className="mt-1">{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      By {review.user?.firstName} {review.user?.lastName} on{' '}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
              {localStorage.getItem('token') && (
                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                      className="w-24"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Comment</label>
                    <Textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full"
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit">Submit Review</Button>
                </form>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{property.title}</h1>
            <p className="text-sm text-slate-500 mb-4 capitalize">{property.status}</p>
            {property.subscription?.plan && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
                  property.subscription.plan === 'platinum'
                    ? 'bg-yellow-500 text-white'
                    : property.subscription.plan === 'elite'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300'
                }`}
              >
                {property.subscription.plan.toUpperCase()} Plan
              </span>
            )}
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <MapPin className="h-5 w-5" />
              <p>
                {property.address?.city}, {property.address?.country || 'Mauritius'}
              </p>
            </div>
            <p className="text-slate-600 mb-4">{property.description}</p>
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Property Details</h3>
              <p className="text-sm">
                <strong>Price:</strong> {property.price.toLocaleString()} {property.currency}
              </p>
              <p className="text-sm">
                <strong>Category:</strong> {property.category.charAt(0).toUpperCase() + property.category.slice(1)}
              </p>
              <p className="text-sm">
                <strong>Type:</strong> {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
              </p>
              {property.bedrooms && (
                <p className="text-sm">
                  <strong>Bedrooms:</strong> {property.bedrooms}
                </p>
              )}
              {property.bathrooms && (
                <p className="text-sm">
                  <strong>Bathrooms:</strong> {property.bathrooms}
                </p>
              )}
              {property.area && (
                <p className="text-sm">
                  <strong>Area:</strong> {property.area} sqm
                </p>
              )}
            </div>
            {property.amenities?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {property.category === 'rent' && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Availability</h3>
                <Calendar
                  tileDisabled={({ date }) =>
                    availability.some(
                      (a) =>
                        a.status === 'booked' &&
                        date >= new Date(a.startDate) &&
                        date <= new Date(a.endDate)
                    )
                  }
                  className="w-full"
                />
                {user && property.owner.toString() === user._id && (
                  <div className="mt-4">
                    <AvailabilityForm propertyId={id} onSuccess={(newAvailability) => {
                      setAvailability([...availability, newAvailability]);
                      toast({ title: 'Success', description: 'Availability added' });
                    }} />
                  </div>
                )}
              </div>
            )}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold mb-2">Contact Agent</h3>
              <div className="flex items-center gap-4">
                <img
                  src={property.agent?.user?.avatar || '/defaultAvatar.jpg'}
                  alt={`${property.agent?.user?.firstName} ${property.agent?.user?.lastName}`}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="font-bold">
                    {property.agent?.user?.firstName} {property.agent?.user?.lastName}
                  </p>
                  <p className="text-sm text-slate-600">Real Estate Agent</p>
                  {localStorage.getItem('token') ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <p>{property.agent?.user?.phone || 'Not provided'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4" />
                        <p>{property.agent?.user?.email}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">
                      <a href="/login" className="text-blue-600 hover:underline">
                        Log in
                      </a>{' '}
                      to view contact details
                    </p>
                  )}
                </div>
              </div>
            </div>
            {!localStorage.getItem('token') && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Send Inquiry</h3>
                <InquiryForm propertyId={id} agentId={property.agent?._id} />
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const InquiryForm = ({ propertyId, agentId }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, propertyId, agentId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit inquiry');
      }

      toast({ title: 'Inquiry Sent', description: 'Your inquiry has been sent to the agent' });
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send inquiry',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Inquiry'}
      </Button>
    </form>
  );
};

export default PropertyDetails;