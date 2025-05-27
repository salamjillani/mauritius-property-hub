import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/properties`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();
        setProperties(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  const handleStatusChange = async (propertyId, status) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/properties/${propertyId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update property status");
      }

      const data = await response.json();
      setProperties(
        properties.map((p) => (p._id === propertyId ? data.data : p))
      );
      toast({
        title: "Success",
        description: `Property status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive",
      });
    }
  };

  const handleEmailOwner = (property) => {
    const subject = encodeURIComponent(`Changes Required for Property: ${property.title}`);
    const body = encodeURIComponent(
      `Dear ${property.owner.firstName},\n\nWe have reviewed your property listing "${property.title}" and require some changes before approval. Please address the following:\n\n[Add your feedback here]\n\nBest regards,\nAdmin Team`
    );
    window.location.href = `mailto:${property.owner.email}?subject=${subject}&body=${body}`;
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Manage Properties</h1>
        <div className="space-y-4">
          {properties.length === 0 ? (
            <p className="text-gray-500">No properties available.</p>
          ) : (
            properties.map((property) => (
              <Card key={property._id} className={property.status === "pending" ? "border-yellow-500" : ""}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{property.title}</span>
                    <span
                      className={`text-sm capitalize ${
                        property.status === "approved"
                          ? "text-green-500"
                          : property.status === "rejected"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    >
                      {property.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{property.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {property.address?.city}, {property.address?.country || "Mauritius"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Owner: {property.owner?.email}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <Select
                      onValueChange={(value) => handleStatusChange(property._id, value)}
                      defaultValue={property.status}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Link to={`/properties/${property._id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleEmailOwner(property)}
                      className="flex items-center gap-2"
                    >
                      <Mail size={16} />
                      Email Owner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminProperties;