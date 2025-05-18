import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const fetchProperties = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`);
  return res.json();
};

const Properties = () => {
  const { data, isLoading } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">All Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.data.map((property) => (
          <Card key={property._id}>
            <CardContent className="p-4">
              <img 
                src={property.images[0]?.url}
                className="w-full h-48 object-cover"
              />
              <h3 className="text-xl font-semibold mt-4">{property.title}</h3>
              <p className="text-gray-600">{property.address.city}</p>
              <p className="text-lg font-bold">MUR {property.price.toLocaleString()}</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to={`/properties/${property._id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Properties;