import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home, ArrowRight, Compass } from 'lucide-react';

const fetchProperties = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`);
  return res.json();
};

const Properties = () => {
  const { data, isLoading } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  
  if (isLoading) return (
    <div className="container mx-auto p-8 flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-gray-600">Discovering exceptional properties...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Discover Your Dream Property</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">Browse through our carefully curated collection of premium properties across Mauritius</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.data.map((property) => (
            <Card key={property._id} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white rounded-xl">
              <div className="relative">
                {property.images[0]?.url ? (
                  <img 
                    src={property.images[0]?.url}
                    alt={property.title}
                    className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-64 bg-slate-200 flex items-center justify-center">
                    <Home className="h-16 w-16 text-slate-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {property.type || 'Property'}
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{property.title}</h3>
                <div className="flex items-center text-slate-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <p className="text-sm">{property.address.city}</p>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  {property.bedrooms > 0 && (
                    <div className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700">
                      {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700">
                      {property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                    </div>
                  )}
                  {property.size && (
                    <div className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700">
                      {property.size} m²
                    </div>
                  )}
                </div>
                
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-2xl font-bold text-primary">MUR {property.price.toLocaleString()}</p>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pb-6 pt-0">
                <Button asChild className="w-full group">
                  <Link to={`/properties/${property._id}`} className="flex items-center justify-center">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Properties;