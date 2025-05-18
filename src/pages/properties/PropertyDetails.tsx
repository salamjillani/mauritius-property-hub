import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Home, Bed, Bath, Square, Check, Phone, Mail, ArrowLeft, Star } from "lucide-react";

const fetchProperty = async (id) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/properties/${id}`
  );
  if (!res.ok) throw new Error('Failed to fetch property');
  return res.json();
};

const PropertyDetails = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(id),
  });

  if (isLoading) return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-8 w-2/3 rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-full rounded-lg" />
            <Skeleton className="h-6 w-full rounded-lg" />
            <Skeleton className="h-6 w-full rounded-lg" />
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <h3 className="text-red-600 text-lg font-medium mb-2">Error Loading Property</h3>
        <p className="text-red-500">{error.message}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/properties"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties</Link>
        </Button>
      </div>
    </div>
  );

  const property = data.data;
  
  // Check if agent data exists and has a valid _id
  const hasValidAgent = property.agent && property.agent._id;

  // Helper function to format price with commas
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toLocaleString() : price;
  };

  return (
    <div className="container mx-auto p-4 py-8 max-w-7xl">
      {/* Breadcrumb & Back button */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2 p-2" asChild>
          <Link to="/properties"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="text-sm text-gray-500">
          Properties / {property.type || 'Property'} / {property.address?.city || 'Details'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl shadow-lg mb-4 bg-gray-50">
            {property.images && property.images[0]?.url ? (
              <img
                src={property.images[0].url}
                alt={property.title}
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                <Home className="h-20 w-20 text-gray-300" />
              </div>
            )}
          </div>
          
          {/* Thumbnail gallery */}
          {property.images && property.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {property.images.slice(1, 5).map((image, i) => (
                <div key={i} className="overflow-hidden rounded-lg shadow-sm h-24">
                  <img 
                    src={image.url} 
                    alt={`${property.title} - view ${i+2}`} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Description Section */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold border-b pb-4 mb-4">About this property</h2>
            <p className="text-gray-700 leading-relaxed">
              {property.description || 'No description provided for this property.'}
            </p>
            
            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Amenities & Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center group">
                      <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="ml-2 text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Price & Title Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{property.title}</h1>
              {property.featured && (
                <div className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded flex items-center">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                  Featured
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-primary mt-3">
              MUR {formatPrice(property.price)}
            </p>
          </div>
          
          {/* Property Details Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {property.address?.city && (
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">{property.address.city}</p>
                  </div>
                </div>
              )}
              
              {property.type && (
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Home className="h-4 w-4 text-primary" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium">{property.type}</p>
                  </div>
                </div>
              )}
              
              {property.size && (
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Square className="h-4 w-4 text-primary" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="font-medium">{property.size} m²</p>
                  </div>
                </div>
              )}
              
              {property.bedrooms > 0 && (
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Bed className="h-4 w-4 text-primary" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-gray-500">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              
              {property.bathrooms > 0 && (
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Bath className="h-4 w-4 text-primary" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-gray-500">Bathrooms</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Agent Contact Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Contact Details</h2>
            {hasValidAgent ? (
              <div>
                <div className="flex items-center mb-4">
                  {property.agent.avatar ? (
                    <img 
                      src={property.agent.avatar} 
                      alt={property.agent.name} 
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary font-bold text-lg">
                        {property.agent.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{property.agent.name || 'Real Estate Agent'}</p>
                    <p className="text-sm text-gray-500">Licensed Agent</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  {property.agent.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-primary mr-2" />
                      <span>{property.agent.phone}</span>
                    </div>
                  )}
                  {property.agent.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">{property.agent.email}</span>
                    </div>
                  )}
                </div>
                
                <Button className="w-full" asChild>
                  <Link to={`/agents/${property.agent._id}`}>
                    Contact Agent
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500">No agent information available</p>
             
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;