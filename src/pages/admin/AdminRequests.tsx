import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const AdminRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listingLimit, setListingLimit] = useState("15");
  const [goldCards, setGoldCards] = useState("0");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/requests?status=pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch requests");
        const data = await response.json();
        setRequests(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load requests",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [toast]);

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/requests/${requestId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listingLimit: listingLimit === 'unlimited' ? null : parseInt(listingLimit),
            goldCards: parseInt(goldCards),
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to approve request");
      setRequests(requests.filter((request) => request._id !== requestId));
      toast({
        title: "Success",
        description: "Request approved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/requests/${requestId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );
      if (!response.ok) throw new Error("Failed to reject request");
      setRequests(requests.filter((request) => request._id !== requestId));
      toast({
        title: "Success",
        description: "Request rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Registration Requests</h1>
        {requests.length === 0 ? (
          <p className="text-gray-500">No pending requests available.</p>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <CardTitle>
                    {request.firstName} {request.lastName} (
                    {request.user?.role || 'N/A'})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p><strong>Gender:</strong> {request.gender}</p>
                      <p><strong>Phone:</strong> {request.phoneNumber}</p>
                      <p><strong>Email:</strong> {request.email}</p>
                    </div>
                    <div>
                      <p><strong>Company:</strong> {request.companyName || "N/A"}</p>
                      <p><strong>Place of Birth:</strong> {request.placeOfBirth}</p>
                      <p><strong>City:</strong> {request.city}, {request.country}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor={`listingLimit-${request._id}`}>
                      Listing Limit
                    </Label>
                    <Select
                      value={listingLimit}
                      onValueChange={setListingLimit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="300">300</SelectItem>
                        <SelectItem value="400">400</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor={`goldCards-${request._id}`}>
                      Gold Cards
                    </Label>
                    <Input
                      id={`goldCards-${request._id}`}
                      type="number"
                      min="0"
                      value={goldCards}
                      onChange={(e) => setGoldCards(e.target.value)}
                    />
                  </div>
                  
                  <div className="mt-6 flex space-x-2">
                    <Button onClick={() => handleApprove(request._id)}>
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt(
                          "Please provide a reason for rejection:"
                        );
                        if (reason) handleReject(request._id, reason);
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminRequests;