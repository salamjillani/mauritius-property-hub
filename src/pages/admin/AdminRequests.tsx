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
  const [featuredListings, setFeaturedListings] = useState("0");
  const [userType, setUserType] = useState("basic");

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
            featuredListings: parseInt(featuredListings),
            userType
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading requests...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171F2E] mb-4">
            Registration Requests              
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Review and manage pending user registration requests
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-4"></div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Requests</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              All registration requests have been processed. New requests will appear here when submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request._id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {request.firstName.charAt(0)}{request.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {request.firstName} {request.lastName}
                        </h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-1">
                          {request.user?.role || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Gender</p>
                          <p className="font-semibold text-gray-800">{request.gender}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Phone</p>
                          <p className="font-semibold text-gray-800">{request.phoneNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Email</p>
                          <p className="font-semibold text-gray-800 break-all">{request.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Company</p>
                          <p className="font-semibold text-gray-800">{request.companyName || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Place of Birth</p>
                          <p className="font-semibold text-gray-800">{request.placeOfBirth}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Location</p>
                          <p className="font-semibold text-gray-800">{request.city}, {request.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      Account Configuration
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor={`userType-${request._id}`} className="text-sm font-medium text-gray-700">
                          User Type
                        </Label>
                        <Select
                          value={userType}
                          onValueChange={setUserType}
                        >
                          <SelectTrigger className="w-full bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select user type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="elite">Elite</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`featuredListings-${request._id}`} className="text-sm font-medium text-gray-700">
                          Featured Listings Allowed
                        </Label>
                        <Input
                          id={`featuredListings-${request._id}`}
                          type="number"
                          min="0"
                          value={featuredListings}
                          onChange={(e) => setFeaturedListings(e.target.value)}
                          className="w-full bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter number of featured listings"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {request.user?.role !== 'individual' && (
                    <div className="border-t border-gray-100 pt-6 mt-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        Account Configuration
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor={`listingLimit-${request._id}`} className="text-sm font-medium text-gray-700">
                            Listing Limit
                          </Label>
                          <Select
                            value={listingLimit}
                            onValueChange={setListingLimit}
                          >
                            <SelectTrigger className="w-full bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
                        
                        <div className="space-y-2">
                          <Label htmlFor={`goldCards-${request._id}`} className="text-sm font-medium text-gray-700">
                            Gold Cards
                          </Label>
                          <Input
                            id={`goldCards-${request._id}`}
                            type="number"
                            min="0"
                            value={goldCards}
                            onChange={(e) => setGoldCards(e.target.value)}
                            className="w-full bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter number of gold cards"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => handleApprove(request._id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Approve Request
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt(
                            "Please provide a reason for rejection:"
                          );
                          if (reason) handleReject(request._id, reason);
                        }}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject Request
                      </Button>
                    </div>
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