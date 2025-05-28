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
      let response;
      
      if (status === 'approved') {
        // Use the approve endpoint
        response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/properties/${propertyId}/approve`,
          {
            method: "POST", // Changed to POST
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else if (status === 'rejected') {
        // Use the reject endpoint
        response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/properties/${propertyId}/reject`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: "Rejected by admin" }), // Optional reason
          }
        );
      } else {
        // For other status changes, use the generic update endpoint
        response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/properties/${propertyId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update property status");
      }

      const data = await response.json();
      
      // Update the property in the state
      setProperties(prevProperties =>
        prevProperties.map((p) => (p._id === propertyId ? data.data : p))
      );
      
      toast({
        title: "Success",
        description: `Property status updated to ${status}`,
      });
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update property status",
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
                      className={`text-sm capitalize px-2 py-1 rounded ${
                        property.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : property.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : property.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : property.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
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
                  {property.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Rejection Reason: {property.rejectionReason}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <Select
                      onValueChange={(value) => handleStatusChange(property._id, value)}
                      value={property.status}
                      disabled={property.status === "inactive"}
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