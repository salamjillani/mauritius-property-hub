import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const ListingsTab = ({ userId }) => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/properties?owner=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        setListings(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load listings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [userId, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <Link to="/properties/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Property
          </Button>
        </Link>
      </div>
      {listings.length === 0 ? (
        <p className="text-gray-500">No listings available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="truncate">{listing.title}</span>
                  <span
                    className={`text-sm capitalize ${
                      listing.status === "approved"
                        ? "text-green-500"
                        : listing.status === "rejected"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {listing.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={listing.images?.[0]?.url || "/placeholder.jpg"}
                  alt={listing.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {listing.address?.city}, {listing.address?.country || "Mauritius"}
                </p>
                <p className="text-lg font-bold mt-2">MUR {listing.price.toLocaleString()}</p>
                <Link to={`/properties/${listing._id}`} className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsTab;