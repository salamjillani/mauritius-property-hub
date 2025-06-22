import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PropertyCard from "@/components/PropertyCard";
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
  Star,
  Home,
  Award,
  Users as UsersIcon,
  TrendingUp
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

          try {
            const agenciesRes = await fetch(
              `${import.meta.env.VITE_API_URL}/api/agencies/approved`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (!agenciesRes.ok) {
              const errorData = await agenciesRes.json();
              throw new Error(errorData.message || "Failed to fetch agencies");
            }

            const agenciesData = await agenciesRes.json();
            setAgencies(agenciesData.data || []);
          } catch (error) {
            console.error("Error fetching agencies:", error);
            toast({
              title: "Error",
              description: "Failed to load agencies",
              variant: "destructive",
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
        } else if (data.data.role === "individual") {
          setProfile(data.data || {});
        }

        if (
          ["individual", "agent", "agency", "promoter"].includes(
            data.data.role
          ) &&
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
        const sortedListings = data.data.sort(
          (a, b) => (b.isGoldCard ? 1 : 0) - (a.isGoldCard ? 1 : 0)
        );
        setListings(sortedListings);
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
      } else if (user.role === "individual") {
        url = (await uploadAgentPhotoToCloudinary(file)).url;
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
      let photoUrl = profile.photoUrl || profile.logoUrl || profile.avatarUrl;

      if (file) {
        photoUrl = await uploadPhoto();
      }

      let updatedProfile = { ...profile };
      if (photoUrl) {
        if (user.role === "agency" || user.role === "promoter") {
          updatedProfile.logoUrl = photoUrl;
        } else if (user.role === "individual") {
          updatedProfile.avatarUrl = photoUrl;
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
          endpoint = `/api/promoters/my-profile`;
          method = "PUT";
        } else {
          endpoint = `/api/promoters`;
          method = "POST";
          isNewProfile = true;
          updatedProfile.user = user.id;
        }
      } else if (user.role === "individual") {
        endpoint = `/api/users/me`;
        method = "PUT";
        updatedProfile = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          ...(photoUrl && { avatarUrl: photoUrl }),
        };
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

      if (user.role === "agent" && photoUrl) {
        setUser({ ...user, avatarUrl: photoUrl });
      }

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

  const handleApproveLink = async (agentId: string, requestId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/agents/${agentId}/approve/${requestId}`,
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
      setRegistrationSubmitted(true);
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">User not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl shadow-xl overflow-hidden mb-8 sm:mb-12"
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="relative group">
                  {user.role === "agency" && profile?.logoUrl && (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                      <img
                        src={profile.logoUrl}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                  </div>
                    )}
         
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-blue-200 capitalize">{user.role}</p>
                {user.role === "agency" && profile && (
                  <p className="text-xl font-semibold mt-1">{profile.name}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <div className="flex items-center justify-center md:justify-start gap-2 text-blue-100">
                  <Phone size={20} />
                  <span>{user?.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-blue-100">
                  <Mail size={20} />
                  <span>{user?.email || "Not provided"}</span>
                </div>

                {user.approvalStatus === "approved" && (
                  <div className="mt-2 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
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
          </div>
        </motion.div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200">
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white px-6 py-3 rounded-xl font-medium"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="listings"
              className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white px-6 py-3 rounded-xl font-medium"
            >
              Listings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              {user.role === "agency" && profile && (
                <AgencyForm
                  profile={profile}
                  setProfile={setProfile}
                  file={file}
                  setFile={setFile}
                  handleSubmit={handleSubmit}
                  isSaving={isSaving}
                  handleApproveLink={(agentId, requestId) =>
                    handleApproveLink(agentId, requestId)
                  }
                  handleRejectLink={handleRejectLink}
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

              {user.role === "individual" && (
                <IndividualForm
                  profile={profile}
                  setProfile={setProfile}
                  file={file}
                  setFile={setFile}
                  handleSubmit={handleSubmit}
                  isSaving={isSaving}
                />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="listings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
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
            </motion.div>
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
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg">
        <p className="font-medium text-amber-800">
          Thank you for your interest. At the moment, you are not yet eligible
          to act as an {user.role} based on your current status. Kindly complete
          the form below to apply for eligibility and approval. We look forward
          to welcoming you soon!
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Please confirm your activity
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="gender" className="text-gray-700">Gender</Label>
            <Select
              name="gender"
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="companyName" className="text-gray-700">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="phoneNumber" className="text-gray-700">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="placeOfBirth" className="text-gray-700">Place of Birth</Label>
            <Input
              id="placeOfBirth"
              name="placeOfBirth"
              value={formData.placeOfBirth}
              onChange={handleChange}
              required
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="city" className="text-gray-700">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="country" className="text-gray-700">Country</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="bg-white"
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
          <Label htmlFor="termsAccepted" className="font-normal text-gray-700">
            I agree to the Terms and Conditions of RealEstate
          </Label>
        </div>

        <div className="text-xs text-gray-500 p-4 bg-gray-50 rounded-lg">
          <p className="font-bold mb-2">Terms and Conditions:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>By submitting this form, you confirm that all information provided is accurate.</li>
            <li>You agree to comply with all platform rules and regulations.</li>
            <li>Approval is subject to verification by our admin team.</li>
            <li>You may be required to provide additional documentation for verification.</li>
          </ol>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-b from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 text-white font-medium py-3 rounded-xl"
        >
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
      className="bg-blue-50 border border-blue-200 rounded-2xl p-8"
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

const ListingsTab = ({ userId, user, listings }) => {
  const isIndividual = user.role === "individual";
  const hasActiveListing =
    isIndividual && listings.some((l) => l.status === "active");
  const isListingExpired = (listing) => {
    const createdAt = new Date(listing.createdAt);
    const expiresAt = new Date(createdAt.setDate(createdAt.getDate() + 60));
    return new Date() > expiresAt;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Listings</h2>
        {user.approvalStatus === "approved" && (
          <Link to={hasActiveListing ? "#" : "/properties/add"}>
            <Button 
              disabled={hasActiveListing}
              className="bg-gradient-to-b from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 text-white"
            >
              Add New Listing
            </Button>
          </Link>
        )}
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

      {isIndividual && hasActiveListing && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p>
            You can only have one active listing at a time. Your listing will
            expire in 60 days.
          </p>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
            <Home size={40} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No listings yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            You haven't created any property listings. Start by adding your first property!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
             <PropertyCard
              key={listing._id}
              property={listing}
              currency="MUR"
              variant="standard"
              isExpired={isIndividual && isListingExpired(listing)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const IndividualForm = ({
  profile,
  setProfile,
  file,
  setFile,
  handleSubmit,
  isSaving,
}) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Individual Profile</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="avatar" className="text-gray-700">Profile Photo</Label>
        <div className="flex items-center gap-4 mt-2">
          {profile.avatarUrl && (
            <div className="relative group">
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 group-hover:opacity-90 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </div>
          )}
          <Input
            type="file"
            id="avatar"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="bg-white"
          />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
        <Input
          id="firstName"
          value={profile.firstName || ""}
          onChange={(e) =>
            setProfile({ ...profile, firstName: e.target.value })
          }
          className="bg-white"
        />
      </div>
      <div>
        <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
        <Input
          id="lastName"
          value={profile.lastName || ""}
          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
          className="bg-white"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="phone" className="text-gray-700">Phone</Label>
        <Input
          id="phone"
          value={profile.phone || ""}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          className="bg-white"
        />
      </div>
      <div>
        <Label htmlFor="email" className="text-gray-700">Email</Label>
        <Input
          id="email"
          type="email"
          value={profile.email || ""}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          disabled
          className="bg-gray-100"
        />
      </div>
    </div>
    <Button 
      type="submit" 
      disabled={isSaving}
      className="bg-gradient-to-b from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 text-white font-medium py-3 rounded-xl"
    >
      {isSaving ? "Saving..." : "Save Profile"}
    </Button>
  </form>
);

const AgencyForm = ({
  profile,
  setProfile,
  file,
  setFile,
  handleSubmit,
  isSaving,
  handleApproveLink,
  handleRejectLink,
}) => {
  const { toast } = useToast();
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/agents/linking-requests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch linking requests");
        }

        const data = await response.json();
        setPendingRequests(data.data || []);
      } catch (error) {
        console.error("Error fetching linking requests:", error);
        toast({
          title: "Error",
          description: "Failed to load pending linking requests",
          variant: "destructive",
        });
      }
    };

    if (profile._id) {
      fetchPendingRequests();
    }
  }, [profile._id, toast]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Agency Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="logo" className="text-gray-700">Logo</Label>
          <div className="flex items-center gap-4 mt-2">
            {profile.logoUrl && (
              <div className="relative group">
                <img
                  src={profile.logoUrl}
                  alt="Agency Logo"
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 group-hover:opacity-90 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <span className="text-white text-xs font-medium">Change</span>
                </div>
              </div>
            )}
            <Input
              type="file"
              id="logo"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-white"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="name" className="text-gray-700">Agency Name</Label>
          <Input
            id="name"
            value={profile.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="bg-white"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description" className="text-gray-700">Description</Label>
        <Textarea
          id="description"
          value={profile.description || ""}
          onChange={(e) =>
            setProfile({ ...profile, description: e.target.value })
          }
          rows={4}
          className="bg-white"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="establishedYear" className="text-gray-700">Established Year</Label>
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
            className="bg-white"
          />
        </div>
      </div>
      
      {profile.agents && profile.agents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Linked Agents</h3>
          <div className="space-y-3">
            {profile.agents.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50"
              >
                <img
                  src={agent.photoUrl || "/default-avatar.jpg"}
                  alt={agent.user?.firstName}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-800">
                    {agent.user?.firstName} {agent.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{agent.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Pending Agent Linking Requests
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((agent) =>
              agent.linkingRequests
                .filter(
                  (req) =>
                    req.status === "pending" &&
                    req.agency.toString() === profile._id
                )
                .map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-3 border rounded-xl bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={agent.photoUrl || "/default-avatar.jpg"}
                        alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {agent.user?.firstName} {agent.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {agent.title || "Agent"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleApproveLink(agent._id, request._id)
                        }
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectLink(agent._id, request._id)}
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
      <Button 
        type="submit" 
        disabled={isSaving}
        className="bg-gradient-to-b from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 text-white font-medium py-3 rounded-xl"
      >
        {isSaving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
};

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
    <h2 className="text-2xl font-bold text-gray-800">Agent Profile</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="photo" className="text-gray-700">Profile Photo</Label>
        <div className="flex items-center gap-4 mt-2">
          {profile.photoUrl && (
            <div className="relative group">
              <img
                src={profile.photoUrl}
                alt="Agent Photo"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 group-hover:opacity-90 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </div>
          )}
          <Input
            type="file"
            id="photo"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="bg-white"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="title" className="text-gray-700">Professional Title</Label>
        <Input
          id="title"
          value={profile.title || ""}
          onChange={(e) => setProfile({ ...profile, title: e.target.value })}
          className="bg-white"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="professionalTitle" className="text-gray-700">Job Title</Label>
        <Input
          id="professionalTitle"
          value={profile.professionalTitle || ""}
          onChange={(e) =>
            setProfile({ ...profile, professionalTitle: e.target.value })
          }
          className="bg-white"
        />
      </div>
      <div>
        <Label htmlFor="specialization" className="text-gray-700">Specialization</Label>
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
          className="bg-white"
        />
      </div>
    </div>
    <div>
      <Label htmlFor="biography" className="text-gray-700">Biography</Label>
      <Textarea
        id="biography"
        value={profile.biography || ""}
        onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
        rows={4}
        className="bg-white"
      />
    </div>
    
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Agency Link</h3>
      {profile.agency ? (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
          <img
            src={profile.agency.logoUrl || "/default-logo.jpg"}
            alt={profile.agency.name}
            className="h-16 w-16 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-800">Linked with: {profile.agency.name}</p>
            <p className="text-sm text-gray-600">Status: Approved</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label className="text-gray-700">Select Agency</Label>
              <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select an agency" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.length === 0 ? (
                    <div className="text-gray-500 p-2 text-sm">
                      No approved agencies available
                    </div>
                  ) : (
                    agencies.map((agency) => (
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
                className="bg-gradient-to-b from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 text-white w-full"
              >
                Send Request
              </Button>
            </div>
          </div>
          {profile.linkingRequests && profile.linkingRequests.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Pending Requests</h4>
              <div className="space-y-2">
                {profile.linkingRequests
                  .filter((req) => req.status === "pending")
                  .map((req) => {
                    const agency = agencies.find(
                      (a) => a._id === (req.agency?._id || req.agency)
                    );

                    return (
                      <div
                        key={req._id}
                        className="flex items-center justify-between p-3 border rounded-xl bg-white"
                      >
                        <div className="flex items-center gap-3">
                          {agency?.logoUrl ? (
                            <img
                              src={agency.logoUrl}
                              alt={agency.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                          )}
                          <span className="text-gray-800">{agency?.name || "Unknown Agency"}</span>
                        </div>
                        <span className="text-yellow-600 font-medium">Pending</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    <Button 
      type="submit" 
      disabled={isSaving}
      className="bg-gradient-to-b from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 text-white font-medium py-3 rounded-xl"
    >
      {isSaving ? "Saving..." : "Save Profile"}
    </Button>
  </form>
);

const PromoterForm = ({
  profile,
  setProfile,
  file,
  setFile,
  handleSubmit,
  isSaving,
}) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Promoter Profile</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="logo" className="text-gray-700">Logo</Label>
        <div className="flex items-center gap-4 mt-2">
          {profile.logoUrl && (
            <div className="relative group">
              <img
                src={profile.logoUrl}
                alt="Promoter Logo"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 group-hover:opacity-90 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </div>
          )}
          <Input
            type="file"
            id="logo"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="bg-white"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="name" className="text-gray-700">Promoter Name</Label>
        <Input
          id="name"
          value={profile.name || ""}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="bg-white"
        />
      </div>
    </div>
    <div>
      <Label htmlFor="description" className="text-gray-700">Description</Label>
      <Textarea
        id="description"
        value={profile.description || ""}
        onChange={(e) =>
          setProfile({ ...profile, description: e.target.value })
        }
        rows={4}
        className="bg-white"
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="specialties" className="text-gray-700">Specialties</Label>
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
          className="bg-white"
        />
      </div>
      <div>
        <Label htmlFor="establishedYear" className="text-gray-700">Established Year</Label>
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
          className="bg-white"
        />
      </div>
    </div>
   
    <Button 
      type="submit" 
      disabled={isSaving}
      className="bg-gradient-to-b from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 text-white font-medium py-3 rounded-xl"
    >
      {isSaving ? "Saving..." : "Save Profile"}
    </Button>
  </form>
);


export default Profile;