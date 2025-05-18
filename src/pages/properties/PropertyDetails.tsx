import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

const fetchProperty = async (id) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
  return res.json();
};

const PropertyDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['property', id], queryFn: () => fetchProperty(id) });

  if (isLoading) return <div>Loading...</div>;

  const property = data.data;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
    <img src={property.images[0]?.url}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="text-2xl font-bold text-primary mt-4">
            MUR {property.price.toLocaleString()}
          </p>
          <div className="mt-4 space-y-2">
            <p><strong>Location:</strong> {property.address.city}</p>
            <p><strong>Type:</strong> {property.type}</p>
            <p><strong>Size:</strong> {property.size} m²</p>
            {property.bedrooms && <p><strong>Bedrooms:</strong> {property.bedrooms}</p>}
            {property.bathrooms && <p><strong>Bathrooms:</strong> {property.bathrooms}</p>}
          </div>
          <Button className="mt-8">Contact Agent</Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;