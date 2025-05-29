import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    gender: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    placeOfBirth: "",
    city: "",
    country: "",
    termsAccepted: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/getMe`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user: ${errorText}`);
        }
        const data = await response.json();
        if (!data.success || !data.data) {
          throw new Error("Invalid response from server");
        }
        console.log("Fetched user data:", data.data); // Debug log
        setUser(data.data);
        setFormData({
          gender: "",
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          phoneNumber: data.data.phone || "",
          email: data.data.email || "",
          companyName: "",
          placeOfBirth: "",
          city: "",
          country: "",
          termsAccepted: false,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive",
        });
        console.error("Fetch user error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [toast]);

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      toast({
        title: "Error",
        description: "You must accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/registration-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit registration request: ${errorText}`);
      }
      toast({
        title: "Success",
        description: "Registration request submitted successfully",
      });
      setFormData({
        gender: "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phoneNumber: user?.phone || "",
        email: user?.email || "",
        companyName: "",
        placeOfBirth: "",
        city: "",
        country: "",
        termsAccepted: false,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit registration request",
        variant: "destructive",
      });
      console.error("Form submission error:", error);
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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">User not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const isRestrictedRole = ["agent", "agency", "promoter"].includes(user.role) && user.approvalStatus !== "approved";
  const isAdmin = ["admin", "sub-admin"].includes(user.role);
  console.log("User role:", user.role, "Approval status:", user.approvalStatus, "isRestrictedRole:", isRestrictedRole); // Debug log

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-lg p-8 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={user.avatarUrl || "/default-avatar.jpg"}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-32 w-32 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
              <p className="text-gray-600 capitalize">{user.role}</p>
              {user.approvalStatus === "approved" && (
                <>
                  <p className="text-gray-600">Listings Assigned: {user.listingLimit || "Unlimited"}</p>
                  <p className="text-gray-600">Gold Cards Assigned: {user.goldCards || 0}</p>
                </>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Mail size={20} />
                <p>{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={20} />
                <p>{user.phone || "Not provided"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-4">Profile Overview</h2>
              <p className="text-gray-600">Manage your profile details and preferences.</p>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            {["agent", "agency", "promoter"].includes(user.role) && user.approvalStatus !== "approved" ? (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">Listings</h2>
                <p className="text-gray-600 mb-4">
                  Thank you for your interest. At the moment, you are not yet eligible to act as an{" "}
                  {user.role} based on your current status. Kindly complete the form below to apply
                  for eligibility and approval. We look forward to welcoming you soon!
                </p>
                <h3 className="text-lg font-semibold mb-4">Please confirm your activity:</h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      onValueChange={(value) => handleFormChange("gender", value)}
                      value={formData.gender}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleFormChange("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleFormChange("lastName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleFormChange("companyName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="placeOfBirth">Place of Birth</Label>
                    <Input
                      id="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={(e) => handleFormChange("placeOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleFormChange("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleFormChange("country", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleFormChange("termsAccepted", checked)}
                    />
                    <Label htmlFor="terms">
                      I agree to the{" "}
                      <a href="/terms" className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </a>
                    </Label>
                  </div>
                  <Button type="submit">Complete Registration Form</Button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">Your Listings</h2>
                <Button onClick={() => navigate("/properties/add")}>Add New Property</Button>
                {/* Add logic to display user's listings */}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <p className="text-gray-600">Update your account settings.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;