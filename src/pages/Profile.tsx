import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Heart,
  Bed,
  Bath,
  MapPin,
  Square,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

import { Link } from "react-router-dom";
import {
  uploadAgentPhotoToCloudinary,
  uploadAgencyLogoToCloudinary,
  uploadPromoterLogoToCloudinary,
} from "@/utils/cloudinaryService";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

 useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/getMe`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setUser(data.data);

      if (data.data.role === "agency") {
        try {
          const agencyRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/agencies/my-agency`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const agencyData = await agencyRes.json();
          // Handle empty agency case
          setProfile(agencyData.data || {});
        } catch (error) {
          setProfile({});
        }
      } else if (data.data.role === "agent") {
        const agentRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/agents/my-profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const agentData = await agentRes.json();
        setProfile(agentData.data || {});

        // Enhanced error handling for agencies fetch
        try {
          const agenciesRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/agencies/approved`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (!agenciesRes.ok) {
            throw new Error('Failed to fetch agencies');
          }
          
          const agenciesData = await agenciesRes.json();
          setAgencies(agenciesData.data || []);
        } catch (error) {
          console.error('Error fetching agencies:', error);
          toast({ 
            title: "Error", 
            description: "Failed to load agencies", 
            variant: "destructive" 
          });
          setAgencies([]);
        }
      } else if (data.data.role === "promoter") {
        try {
          const promoterRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/promoters/my-profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const promoterData = await promoterRes.json();
          setProfile(promoterData.data || {});
        } catch (error) {
          setProfile({});
        }
      }

      if (
        ["agent", "agency", "promoter"].includes(data.data.role) &&
        data.data.approvalStatus === "pending"
      ) {
        setShowRegistrationForm(true);
      }

      fetchListings(token, data.data._id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

    const fetchListings = async (token: string, userId: string) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/properties?owner=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setListings(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load listings",
          variant: "destructive",
        });
      }
    };

    fetchUser();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadPhoto = async () => {
    if (!file) return null;

    try {
      let url = "";
      if (user.role === "agency") {
        url = (await uploadAgencyLogoToCloudinary(file)).url;
      } else if (user.role === "agent") {
        url = (await uploadAgentPhotoToCloudinary(file)).url;
      } else if (user.role === "promoter") {
        url = (await uploadPromoterLogoToCloudinary(file)).url;
      }

      return url;
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      let photoUrl = profile.photoUrl || profile.logoUrl;

      if (file) {
        photoUrl = await uploadPhoto();
      }

      const updatedProfile = { ...profile };
      if (photoUrl) {
        if (user.role === "agency" || user.role === "promoter") {
          updatedProfile.logoUrl = photoUrl;
        } else {
          updatedProfile.photoUrl = photoUrl;
        }
      }

      let endpoint = "";
      let method = "PUT";
      let isNewProfile = false;

      if (user.role === "agency") {
        if (profile._id) {
          endpoint = `/api/agencies/${profile._id}`;
        } else {
          endpoint = `/api/agencies`;
          method = "POST";
          isNewProfile = true;
        }
      } else if (user.role === "agent") {
        if (profile._id) {
          endpoint = `/api/agents/${profile._id}`;
        } else {
          endpoint = `/api/agents`;
          method = "POST";
          isNewProfile = true;
        }
      } else if (user.role === "promoter") {
        if (profile._id) {
          // Existing profile - update
          endpoint = `/api/promoters/my-profile`;
          method = "PUT";
        } else {
          // New profile - create
          endpoint = `/api/promoters`;
          method = "POST";
          isNewProfile = true;
          // Add user ID for new promoter profile
          updatedProfile.user = user.id;
        }
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await response.json();
      setProfile(data.data);
      toast({ title: "Success", description: "Profile updated successfully" });

      // Update user avatar if agent photo changed
      if (user.role === "agent" && photoUrl) {
        setUser({ ...user, avatarUrl: photoUrl });
      }

      // Update user role if creating new profile
      if (isNewProfile) {
        setUser({ ...user, role: user.role });
      }
    } catch (error) {
      console.error("Profile save error:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestLink = async () => {
    if (!selectedAgency) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents/request-link`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ agencyId: selectedAgency }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send request");
      }

      const data = await response.json();
      setProfile(data.data);
      toast({
        title: "Success",
        description: "Link request sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request",
        variant: "destructive",
      });
    }
  };

  const handleApproveLink = async (requestId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents/${
          profile._id
        }/approve/${requestId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve request");
      }

      const data = await response.json();
      setProfile(data.data);
      toast({ title: "Success", description: "Agent approved successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleRejectLink = async (requestId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents/${
          profile._id
        }/reject/${requestId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      const data = await response.json();
      setProfile(data.data);
      toast({ title: "Success", description: "Request rejected successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const submitRegistrationForm = async (formData: any) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/registration-requests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit registration");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "Registration submitted for approval",
      });
      setShowRegistrationForm(false);
      setRegistrationSubmitted(true); // Add this line
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit registration",
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
            <div className="relative">
              <img
                src={user.avatarUrl || "/default-avatar.jpg"}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
              />
              {user.role === "agency" && profile?.logoUrl && (
                <img
                  src={profile.logoUrl}
                  alt={profile.name}
                  className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-white p-1 border-2 border-white shadow-md"
                />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 capitalize">{user.role}</p>
              {user.role === "agency" && profile && (
                <p className="text-xl font-semibold mt-1">{profile.name}</p>
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
              {user.approvalStatus === "approved" && (
                <div className="mt-2 bg-teal-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    Listings Allowed: {user.listingLimit || "Unlimited"}
                  </p>
                  <p className="text-sm font-medium">
                    Gold Cards: {user.goldCards}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {user.role === "agency" && profile && (
                <AgencyForm
                  profile={profile}
                  setProfile={setProfile}
                  file={file}
                  setFile={setFile}
                  handleSubmit={handleSubmit}
                  isSaving={isSaving}
                />
              )}

              {user.role === "agent" && (
                <AgentForm
                  profile={profile || {}}
                  setProfile={setProfile}
                  file={file}
                  setFile={setFile}
                  handleSubmit={handleSubmit}
                  isSaving={isSaving}
                  agencies={agencies}
                  selectedAgency={selectedAgency}
                  setSelectedAgency={setSelectedAgency}
                  handleRequestLink={handleRequestLink}
                  handleApproveLink={handleApproveLink}
                  handleRejectLink={handleRejectLink}
                />
              )}

              {user.role === "promoter" && profile && (
                <PromoterForm
                  profile={profile}
                  setProfile={setProfile}
                  file={file}
                  setFile={setFile}
                  handleSubmit={handleSubmit}
                  isSaving={isSaving}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {showRegistrationForm ? (
                <RegistrationForm
                  user={user}
                  onSubmit={submitRegistrationForm}
                />
              ) : registrationSubmitted || user.approvalStatus === "pending" ? (
                <PendingApprovalMessage user={user} />
              ) : (
                <ListingsTab
                  userId={user._id}
                  user={user}
                  listings={listings}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

const RegistrationForm = ({ user, onSubmit }) => {
  const [formData, setFormData] = useState({
    gender: "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phoneNumber: user.phone || "",
    email: user.email || "",
    companyName: "",
    placeOfBirth: "",
    city: "",
    country: "",
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
        <p className="font-medium text-amber-800">
          Thank you for your interest. At the moment, you are not yet eligible
          to act as an {user.role} based on your current status. Kindly complete
          the form below to apply for eligibility and approval. We look forward
          to welcoming you soon!
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">
        Please confirm your activity
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              name="gender"
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="placeOfBirth">Place of Birth</Label>
            <Input
              id="placeOfBirth"
              name="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="termsAccepted"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
            required
            className="mt-1"
          />
          <Label htmlFor="termsAccepted" className="font-normal">
            I agree to the Terms and Conditions of RealEstate
          </Label>
        </div>

        <div className="text-xs text-gray-500 p-4 bg-gray-50 rounded-lg">
          <p>
            <strong>Terms and Conditions:</strong>
          </p>
          <p>
            1. By submitting this form, you confirm that all information
            provided is accurate.
          </p>
          <p>2. You agree to comply with all platform rules and regulations.</p>
          <p>3. Approval is subject to verification by our admin team.</p>
          <p>
            4. You may be required to provide additional documentation for
            verification.
          </p>
        </div>

        <Button type="submit" className="w-full">
          Submit Registration
        </Button>
      </form>
    </div>
  );
};

const PendingApprovalMessage = ({ user }) => (
  <div className="max-w-2xl mx-auto text-center py-12">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-blue-50 border border-blue-200 rounded-xl p-8"
    >
      <div className="flex justify-center mb-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Application Under Review
      </h2>

      <p className="text-gray-600 mb-6 leading-relaxed">
        Thank you for submitting your {user.role} registration! We have received
        your application and our team is currently reviewing your information.
        You will receive an email notification at <strong>{user.email}</strong>{" "}
        once your account has been approved.
      </p>

      <div className="bg-white p-4 rounded-lg border border-blue-100 mb-6">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Application submitted successfully</span>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        This process typically takes 1-3 business days. Thank you for your
        patience!
      </p>
    </motion.div>
  </div>
);

const ListingsTab = ({ userId, user, listings }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">My Listings</h2>
      <Link to="/properties/add">
        <Button>Add New Listing</Button>
      </Link>
    </div>
    {user && (
      <p className="text-gray-600">
        Listings Remaining:{" "}
        {user.listingLimit === null
          ? "Unlimited"
          : user.listingLimit - listings.length}{" "}
        | Gold Cards Available: {user.goldCards}
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

// AgencyForm Component
const AgencyForm = ({
  profile,
  setProfile,
  file,
  setFile,
  handleSubmit,
  isSaving,
}) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <h2 className="text-2xl font-bold">Agency Profile</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="logo">Logo</Label>
        <div className="flex items-center gap-4 mt-2">
          {profile.logoUrl && (
            <img
              src={profile.logoUrl}
              alt="Agency Logo"
              className="h-20 w-20 rounded-full object-cover"
            />
          )}
          <Input
            type="file"
            id="logo"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="name">Agency Name</Label>
        <Input
          id="name"
          value={profile.name || ""}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </div>
    </div>
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={profile.description || ""}
        onChange={(e) =>
          setProfile({ ...profile, description: e.target.value })
        }
        rows={4}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="establishedYear">Established Year</Label>
        <Input
          id="establishedYear"
          type="number"
          value={profile.establishedYear || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              establishedYear: parseInt(e.target.value),
            })
          }
        />
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-3">Social Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Globe size={20} />
          <Input
            placeholder="Website"
            value={profile.website || ""}
            onChange={(e) =>
              setProfile({ ...profile, website: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Facebook size={20} />
          <Input
            placeholder="Facebook"
            value={profile.facebook || ""}
            onChange={(e) =>
              setProfile({ ...profile, facebook: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Twitter size={20} />
          <Input
            placeholder="Twitter"
            value={profile.twitter || ""}
            onChange={(e) =>
              setProfile({ ...profile, twitter: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Linkedin size={20} />
          <Input
            placeholder="LinkedIn"
            value={profile.linkedin || ""}
            onChange={(e) =>
              setProfile({ ...profile, linkedin: e.target.value })
            }
          />
        </div>
      </div>
    </div>
    {profile.agents && profile.agents.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold mb-3">Linked Agents</h3>
        <div className="space-y-3">
          {profile.agents.map((agent) => (
            <div
              key={agent._id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <img
                src={agent.user?.avatarUrl || "/default-avatar.jpg"}
                alt={agent.user?.firstName}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-medium">
                  {agent.user?.firstName} {agent.user?.lastName}
                </p>
                <p className="text-sm text-gray-500">{agent.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    <Button type="submit" disabled={isSaving}>
      {isSaving ? "Saving..." : "Save Profile"}
    </Button>
  </form>
);

// AgentForm Component
const AgentForm = ({
  profile,
  setProfile,
  file,
  setFile,
  handleSubmit,
  isSaving,
  agencies,
  selectedAgency,
  setSelectedAgency,
  handleRequestLink,
  handleApproveLink,
  handleRejectLink,
}) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <h2 className="text-2xl font-bold">Agent Profile</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="photo">Profile Photo</Label>
        <div className="flex items-center gap-4 mt-2">
          {profile.photoUrl && (
            <img
              src={profile.photoUrl}
              alt="Agent Photo"
              className="h-20 w-20 rounded-full object-cover"
            />
          )}
          <Input
            type="file"
            id="photo"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="title">Professional Title</Label>
        <Input
          id="title"
          value={profile.title || ""}
          onChange={(e) => setProfile({ ...profile, title: e.target.value })}
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="professionalTitle">Job Title</Label>
        <Input
          id="professionalTitle"
          value={profile.professionalTitle || ""}
          onChange={(e) =>
            setProfile({ ...profile, professionalTitle: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          value={profile.specialization?.join(", ") || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              specialization: e.target.value.split(",").map((s) => s.trim()),
            })
          }
          placeholder="Comma separated values"
        />
      </div>
    </div>
    <div>
      <Label htmlFor="biography">Biography</Label>
      <Textarea
        id="biography"
        value={profile.biography || ""}
        onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
        rows={4}
      />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-3">Social Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Globe size={20} />
          <Input
            placeholder="Website"
            value={profile.website || ""}
            onChange={(e) =>
              setProfile({ ...profile, website: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Facebook size={20} />
          <Input
            placeholder="Facebook"
            value={profile.facebook || ""}
            onChange={(e) =>
              setProfile({ ...profile, facebook: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Twitter size={20} />
          <Input
            placeholder="Twitter"
            value={profile.twitter || ""}
            onChange={(e) =>
              setProfile({ ...profile, twitter: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Linkedin size={20} />
          <Input
            placeholder="LinkedIn"
            value={profile.linkedin || ""}
            onChange={(e) =>
              setProfile({ ...profile, linkedin: e.target.value })
            }
          />
        </div>
      </div>
    </div>
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-3">Agency Link</h3>
      {profile.agency ? (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <img
            src={profile.agency.logoUrl || "/default-logo.jpg"}
            alt={profile.agency.name}
            className="h-16 w-16 rounded-full"
          />
          <div>
            <p className="font-semibold">Linked with: {profile.agency.name}</p>
            <p className="text-sm text-gray-600">Status: Approved</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label>Select Agency</Label>
              <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agency" />
                </SelectTrigger>
           <SelectContent>
  {agencies.length === 0 ? (
    <div className="text-gray-500 p-2 text-sm">
      No approved agencies available
    </div>
  ) : (
    agencies.map(agency => (
      <SelectItem key={agency._id} value={agency._id}>
        <div className="flex items-center gap-2">
          {agency.logoUrl && (
            <img 
              src={agency.logoUrl} 
              alt={agency.name} 
              className="h-6 w-6 rounded-full" 
            />
          )}
          {agency.name}
        </div>
      </SelectItem>
    ))
  )}
</SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleRequestLink}
                disabled={!selectedAgency}
              >
                Send Link Request
              </Button>
            </div>
          </div>
          {profile.linkingRequests && profile.linkingRequests.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Pending Requests</h4>
              <div className="space-y-2">
                {profile.linkingRequests
                  .filter((req) => req.status === "pending")
                  .map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {req.agency?.logoUrl ? (
                          <img
                            src={req.agency.logoUrl}
                            alt={req.agency.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                        )}
                        <span>{req.agency?.name || "Unknown Agency"}</span>
                      </div>
                      <span className="text-yellow-600">Pending</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    <Button type="submit" disabled={isSaving}>
      {isSaving ? "Saving..." : "Save Profile"}
    </Button>
  </form>
);

// PromoterForm Component
const PromoterForm = ({
  profile,
  setProfile,
  file,
  setFile,
  handleSubmit,
  isSaving,
}) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <h2 className="text-2xl font-bold">Promoter Profile</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="logo">Logo</Label>
        <div className="flex items-center gap-4 mt-2">
          {profile.logoUrl && (
            <img
              src={profile.logoUrl}
              alt="Promoter Logo"
              className="h-20 w-20 rounded-full object-cover"
            />
          )}
          <Input
            type="file"
            id="logo"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="name">Promoter Name</Label>
        <Input
          id="name"
          value={profile.name || ""}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </div>
    </div>
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={profile.description || ""}
        onChange={(e) =>
          setProfile({ ...profile, description: e.target.value })
        }
        rows={4}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="specialties">Specialties</Label>
        <Input
          id="specialties"
          value={profile.specialties?.join(", ") || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              specialties: e.target.value.split(",").map((s) => s.trim()),
            })
          }
          placeholder="Comma separated values"
        />
      </div>
      <div>
        <Label htmlFor="establishedYear">Established Year</Label>
        <Input
          id="establishedYear"
          type="number"
          value={profile.establishedYear || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              establishedYear: parseInt(e.target.value),
            })
          }
        />
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-3">Social Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Globe size={20} />
          <Input
            placeholder="Website"
            value={profile.website || ""}
            onChange={(e) =>
              setProfile({ ...profile, website: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Facebook size={20} />
          <Input
            placeholder="Facebook"
            value={profile.facebook || ""}
            onChange={(e) =>
              setProfile({ ...profile, facebook: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Twitter size={20} />
          <Input
            placeholder="Twitter"
            value={profile.twitter || ""}
            onChange={(e) =>
              setProfile({ ...profile, twitter: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Linkedin size={20} />
          <Input
            placeholder="LinkedIn"
            value={profile.linkedin || ""}
            onChange={(e) =>
              setProfile({ ...profile, linkedin: e.target.value })
            }
          />
        </div>
      </div>
    </div>
    <Button type="submit" disabled={isSaving}>
      {isSaving ? "Saving..." : "Save Profile"}
    </Button>
  </form>
);

// PropertyCard Component (if not already included)
const PropertyCard = ({ property, currency = "MUR", variant = "standard" }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price) => {
    let convertedPrice = price;
    let currencySymbol = "₨";

    if (currency === "USD") {
      convertedPrice = price / 45;
      currencySymbol = "$";
    } else if (currency === "EUR") {
      convertedPrice = price / 50;
      currencySymbol = "€";
    }

    return `${currencySymbol} ${convertedPrice.toLocaleString()}`;
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const getImageUrl = () => {
    if (!property.images || property.images.length === 0) {
      return "https://via.placeholder.com/400x300?text=No+Image";
    }

    const image = property.images[0];
    if (!image || !image.url) {
      return "https://via.placeholder.com/400x300?text=No+Image";
    }

    if (image.url.startsWith("http")) {
      return image.url;
    }

    return `${
      import.meta.env.VITE_API_URL || "http://localhost:5000"
    }/uploads/${image.url}`;
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-xl rounded-xl cursor-pointer ${
        property.isGoldCard
          ? "ring-4 ring-amber-400 bg-amber-50 scale-105"
          : variant === "featured"
          ? property.isPremium
            ? "ring-2 ring-amber-400 shadow-md transform hover:-translate-y-2"
            : "transform hover:-translate-y-1"
          : ""
      }`}
    >
      <Link
        to={`/properties/${property.category || ""}/${property._id}`}
        className="block"
      >
        <div
          className={`relative ${
            variant === "simple" ? "h-48" : "h-64"
          } overflow-hidden`}
        >
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />

          <div className="absolute top-3 left-3 bg-teal-600 text-white text-xs font-semibold rounded-full py-1 px-3 shadow-md z-10">
            {property.type || "Property"}
          </div>

          {(property.isPremium || property.isGoldCard) && (
            <div className="absolute top-3 left-20 bg-amber-500 text-white text-xs font-semibold rounded-full py-1 px-3 shadow-md z-10">
              {property.isGoldCard ? "Gold" : "Premium"}
            </div>
          )}

          {property.agency?.name && property.agency?.logoUrl && (
            <div className="absolute bottom-3 left-3 bg-teal-600/90 text-white text-sm font-semibold rounded-full py-1 pl-2 pr-3 shadow-md flex items-center gap-2 max-w-[150px] truncate z-10">
              <img
                src={property.agency.logoUrl}
                alt={property.agency.name}
                className="h-5 w-5 rounded-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src = "/default-agency-logo.png")
                }
              />
              <span className="truncate">{property.agency.name}</span>
            </div>
          )}

          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={toggleFavorite}
              className={`w-8 h-8 flex items-center justify-center rounded-full shadow-md ${
                isFavorite
                  ? "bg-red-500 text-white"
                  : "bg-white/60 backdrop-blur-sm text-gray-700"
              } transition-all duration-200`}
            >
              <Heart
                className="h-4 w-4"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        </div>

        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">
                {property.title}
              </h3>

              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 mr-1 text-teal-600" />
                <span>{property.address?.city || "Location unavailable"}</span>
              </div>

              <div className="flex items-center justify-start gap-4 mt-3 py-2 border-t border-gray-100">
                {property.bedrooms !== undefined && property.bedrooms > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Bed className="h-4 w-4 mr-1 text-blue-600" />
                    <span className="text-xs">{property.bedrooms}</span>
                  </div>
                )}

                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Bath className="h-4 w-4 mr-1 text-teal-600" />
                    <span className="text-xs">{property.bathrooms}</span>
                  </div>
                )}

                {property.size !== undefined && (
                  <div className="flex items-center text-gray-600">
                    <Square className="h-4 w-4 mr-1 text-amber-600" />
                    <span className="text-xs">{property.size} m²</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="font-bold text-blue-900 text-right">
                {formatPrice(property.price)}
                {property.rentalPeriod && (
                  <span className="text-sm text-gray-600 ml-1">
                    /{property.rentalPeriod}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default Profile;
