import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, Globe, Facebook, Twitter, Linkedin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { uploadAgentPhotoToCloudinary, uploadAgencyLogoToCloudinary, uploadPromoterLogoToCloudinary } from "@/utils/cloudinaryService";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [registrationData, setRegistrationData] = useState({
    gender: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    placeOfBirth: "",
    city: "",
    country: "",
    agreeToTerms: false
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/getMe`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser(data.data);
        
  
if (data.data.role === 'agency') {
  try {
    const agencyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/my-agency`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (agencyRes.status === 404) {
      // User doesn't have an agency profile yet - this is normal for new agencies
      setProfile({}); 
      console.log('No agency profile found - user can create one');
    } else if (!agencyRes.ok) {
      throw new Error(`Failed to load agency profile: ${agencyRes.status}`);
    } else {
      const agencyData = await agencyRes.json();
      setProfile(agencyData.data);
    }
  } catch (error) {
    console.error('Agency profile fetch error:', error);
    // Only show error toast for actual errors, not 404s
    if (!error.message.includes('404')) {
      toast({ 
        title: "Error", 
        description: "Failed to load agency profile", 
        variant: "destructive" 
      });
    }
    setProfile({}); // Set empty profile as fallback
  }
}
        else if (data.data.role === 'agent') {
          const agentRes = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/my-profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const agentData = await agentRes.json();
          setProfile(agentData.data || {});
          
          const agenciesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/approved`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const agenciesData = await agenciesRes.json();
          setAgencies(agenciesData.data);
        } 
        else if (data.data.role === 'promoter') {
          const promoterRes = await fetch(`${import.meta.env.VITE_API_URL}/api/promoters/my-profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const promoterData = await promoterRes.json();
          setProfile(promoterData.data);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
      } finally {
        setIsLoading(false);
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
      if (user.role === 'agency') {
        url = (await uploadAgencyLogoToCloudinary(file)).url;
      } 
      else if (user.role === 'agent') {
        url = (await uploadAgentPhotoToCloudinary(file)).url;
      } 
      else if (user.role === 'promoter') {
        url = (await uploadPromoterLogoToCloudinary(file)).url;
      }
      
      return url;
    } catch (error) {
      toast({ title: "Upload Failed", description: "Failed to upload image", variant: "destructive" });
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
        if (user.role === 'agency') updatedProfile.logoUrl = photoUrl;
        else updatedProfile.photoUrl = photoUrl;
      }
      
      let endpoint = "";
      let method = "PUT";
      
      if (user.role === 'agency') {
        endpoint = `/api/agencies/${profile._id}`;
      } 
      else if (user.role === 'agent') {
        if (profile._id) {
          endpoint = `/api/agents/${profile._id}`;
        } else {
          endpoint = `/api/agents`;
          method = "POST";
        }
      } 
      else if (user.role === 'promoter') {
        endpoint = `/api/promoters/${profile._id}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save profile");
      }
      
      const data = await response.json();
      setProfile(data.data);
      toast({ title: "Success", description: "Profile updated successfully" });
      
      if (user.role === 'agent' && photoUrl) {
        setUser({ ...user, avatarUrl: photoUrl });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestLink = async () => {
    if (!selectedAgency) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/request-link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agencyId: selectedAgency }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send request");
      }
      
      const data = await response.json();
      setProfile(data.data);
      toast({ title: "Success", description: "Link request sent successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
    }
  };

  const handleApproveLink = async (requestId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents/${profile._id}/approve/${requestId}`,
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
      toast({ title: "Error", description: "Failed to approve request", variant: "destructive" });
    }
  };

  const handleRejectLink = async (requestId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents/${profile._id}/reject/${requestId}`,
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
      toast({ title: "Error", description: "Failed to reject request", variant: "destructive" });
    }
  };

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setRegistrationData({
        ...registrationData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setRegistrationData({
        ...registrationData,
        [name]: value
      });
    }
  };

const submitRegistration = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate required fields
  const requiredFields = ['gender', 'firstName', 'lastName', 'phoneNumber', 'email', 'city', 'country'];
  const missingFields = requiredFields.filter(field => !registrationData[field]);
  
  if (missingFields.length > 0) {
    toast({ 
      title: "Missing Information", 
      description: `Please fill in: ${missingFields.join(', ')}`, 
      variant: "destructive" 
    });
    return;
  }
  
  if (!registrationData.agreeToTerms) {
    toast({ 
      title: "Terms Required", 
      description: "You must accept the terms and conditions", 
      variant: "destructive" 
    });
    return;
  }
  
  try {
    const token = localStorage.getItem("token");
    
    // Prepare the request payload
    const requestPayload = {
      gender: registrationData.gender,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      phoneNumber: registrationData.phoneNumber,
      email: registrationData.email,
      companyName: registrationData.companyName,
      placeOfBirth: registrationData.placeOfBirth,
      city: registrationData.city,
      country: registrationData.country,
      role: user.role,
      agreeToTerms: registrationData.agreeToTerms // Send this field directly
    };
    
    console.log('Submitting registration request:', requestPayload); // Debug log
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/registration-requests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to submit registration");
    }

    toast({ 
      title: "Success", 
      description: "Registration request submitted successfully. You will be notified once approved." 
    });
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit registration", variant: "destructive" });
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

  const showRegistrationForm = ['agent', 'agency', 'promoter'].includes(user.role) && 
                             user.approvalStatus !== 'approved';

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
              {user.role === 'agency' && profile?.logoUrl && (
                <img
                  src={profile.logoUrl}
                  alt={profile.name}
                  className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-white p-1 border-2 border-white shadow-md"
                />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
              <p className="text-gray-600 capitalize">{user.role}</p>
              {user.role === 'agency' && profile && (
                <p className="text-xl font-semibold mt-1">{profile.name}</p>
              )}
              {showRegistrationForm && (
                <p className="text-yellow-600 font-medium mt-1">Pending Approval</p>
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

        <Tabs defaultValue={showRegistrationForm ? "listings" : "profile"}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {user.role === 'agency' && profile && (
                <AgencyForm 
                  profile={profile} 
                  setProfile={setProfile}
                  file={file}
                  setFile={setFile}
                  handleSubmit={handleSubmit}
                  isSaving={isSaving}
                />
              )}
              
              {user.role === 'agent' && (
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
              
              {user.role === 'promoter' && profile && (
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
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Registration Required</h2>
                  <p className="text-gray-700">
                    Thank you for your interest. At the moment, you are not yet eligible to act as an {user.role} based on your current status. 
                    Kindly complete the form below to apply for eligibility and approval. We look forward to welcoming you soon!
                  </p>
                  
                  <form onSubmit={submitRegistration} className="space-y-6">
                    <h3 className="text-xl font-semibold">Please confirm your activity:</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          name="gender"
                          value={registrationData.gender}
                          onChange={handleRegistrationChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={registrationData.firstName}
                          onChange={handleRegistrationChange}
                          placeholder="First Name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={registrationData.lastName}
                          onChange={handleRegistrationChange}
                          placeholder="Last Name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={registrationData.phoneNumber}
                          onChange={handleRegistrationChange}
                          placeholder="Phone Number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={registrationData.email}
                          onChange={handleRegistrationChange}
                          placeholder="Email Address"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={registrationData.companyName}
                          onChange={handleRegistrationChange}
                          placeholder="Company Name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="placeOfBirth">Place of Birth</Label>
                        <Input
                          id="placeOfBirth"
                          name="placeOfBirth"
                          value={registrationData.placeOfBirth}
                          onChange={handleRegistrationChange}
                          placeholder="Place of Birth"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={registrationData.city}
                          onChange={handleRegistrationChange}
                          placeholder="City"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={registrationData.country}
                          onChange={handleRegistrationChange}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-3">Terms and Conditions</h4>
                      <p className="text-gray-700 mb-4">
                        By submitting this form, I confirm that all information provided is accurate and complete. 
                        I agree to comply with all platform rules and regulations. I understand that my application 
                        will be reviewed and approval is at the sole discretion of the platform administrators.
                      </p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="agreeToTerms"
                          name="agreeToTerms"
                          checked={registrationData.agreeToTerms}
                          onChange={handleRegistrationChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="agreeToTerms">
                          I agree to the terms and conditions
                        </Label>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={!registrationData.agreeToTerms}
                      className="w-full md:w-auto"
                    >
                      Submit Registration
                    </Button>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-4">Your Listings</h2>
                  <Button onClick={() => navigate("/properties/add")}>Add New Property</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

const AgencyForm = ({ profile, setProfile, file, setFile, handleSubmit, isSaving }) => (
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
          <Input type="file" id="logo" onChange={(e) => setFile(e.target.files?.[0] || null)} />
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
        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
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
          onChange={(e) => setProfile({ ...profile, establishedYear: parseInt(e.target.value) })}
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
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Facebook size={20} />
          <Input
            placeholder="Facebook"
            value={profile.facebook || ""}
            onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Twitter size={20} />
          <Input
            placeholder="Twitter"
            value={profile.twitter || ""}
            onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Linkedin size={20} />
          <Input
            placeholder="LinkedIn"
            value={profile.linkedin || ""}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
          />
        </div>
      </div>
    </div>
    {profile.agents && profile.agents.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold mb-3">Linked Agents</h3>
        <div className="space-y-3">
          {profile.agents.map((agent) => (
            <div key={agent._id} className="flex items-center gap-3 p-3 border rounded-lg">
              <img 
                src={agent.user?.avatarUrl || "/default-avatar.jpg"} 
                alt={agent.user?.firstName} 
                className="h-12 w-12 rounded-full" 
              />
              <div>
                <p className="font-medium">{agent.user?.firstName} {agent.user?.lastName}</p>
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
  handleRejectLink
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
          <Input type="file" id="photo" onChange={(e) => setFile(e.target.files?.[0] || null)} />
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
          onChange={(e) => setProfile({ ...profile, professionalTitle: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          value={profile.specialization?.join(", ") || ""}
          onChange={(e) => setProfile({ 
            ...profile, 
            specialization: e.target.value.split(",").map(s => s.trim()) 
          })}
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
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Facebook size={20} />
          <Input
            placeholder="Facebook"
            value={profile.facebook || ""}
            onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Twitter size={20} />
          <Input
            placeholder="Twitter"
            value={profile.twitter || ""}
            onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Linkedin size={20} />
          <Input
            placeholder="LinkedIn"
            value={profile.linkedin || ""}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
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
                  {agencies.map(agency => (
                    <SelectItem key={agency._id} value={agency._id}>
                      <div className="flex items-center gap-2">
                        {agency.logoUrl && (
                          <img src={agency.logoUrl} alt={agency.name} className="h-6 w-6 rounded-full" />
                        )}
                        {agency.name}
                      </div>
                    </SelectItem>
                  ))}
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
                  .filter(req => req.status === 'pending')
                  .map(req => (
                    <div key={req._id} className="flex items-center justify-between p-3 border rounded-lg">
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

const PromoterForm = ({ profile, setProfile, file, setFile, handleSubmit, isSaving }) => (
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
          <Input type="file" id="logo" onChange={(e) => setFile(e.target.files?.[0] || null)} />
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
        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
        rows={4}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="specialties">Specialties</Label>
        <Input
          id="specialties"
          value={profile.specialties?.join(", ") || ""}
          onChange={(e) => setProfile({ 
            ...profile, 
            specialties: e.target.value.split(",").map(s => s.trim()) 
          })}
          placeholder="Comma separated values"
        />
      </div>
      <div>
        <Label htmlFor="establishedYear">Established Year</Label>
        <Input
          id="establishedYear"
          type="number"
          value={profile.establishedYear || ""}
          onChange={(e) => setProfile({ ...profile, establishedYear: parseInt(e.target.value) })}
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
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Facebook size={20} />
          <Input
            placeholder="Facebook"
            value={profile.facebook || ""}
            onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Twitter size={20} />
          <Input
            placeholder="Twitter"
            value={profile.twitter || ""}
            onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Linkedin size={20} />
          <Input
            placeholder="LinkedIn"
            value={profile.linkedin || ""}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
          />
        </div>
      </div>
    </div>
    <Button type="submit" disabled={isSaving}>
      {isSaving ? "Saving..." : "Save Profile"}
    </Button>
  </form>
);

export default Profile;