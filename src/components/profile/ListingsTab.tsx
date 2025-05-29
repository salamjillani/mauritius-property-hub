import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";

const ListingsTab = ({ userId, user }) => {
  const [listings, setListings] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?owner=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        setListings(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your listings",
          variant: "destructive",
        });
      }
    };

    fetchListings();
  }, [userId, toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <Link to="/properties/add">
          <Button>Add New Listing</Button>
        </Link>
      </div>
      {user && (
        <p className="text-gray-600">
          Listings Remaining: {user.listingLimit - listings.length} | Gold Cards Available: {user.goldCards}
        </p>
      )}
      {listings.length === 0 ? (
        <p className="text-gray-500">You have no listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <PropertyCard key={listing._id} property={listing} currency="MUR" />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsTab;