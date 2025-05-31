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
import { Checkbox } from "@/components/ui/checkbox";
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/getMe`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser(data.data);
        
        // Fetch role-specific profile
        if (data.data.role === 'agency') {
          const agencyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/my-agency`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const agencyData = await agencyRes.json();
          setProfile(agencyData.data);
        } 
        else if (data.data.role === 'agent') {
          const agentRes = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/my-profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const agentData = await agentRes.json();
          setProfile(agentData.data);
          
          // Fetch approved agencies for linking
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
      
      const updatedProfile = { ...profile, ...(photoUrl && 
        (user.role === 'agency' ? { logoUrl: photoUrl } : { photoUrl })) 
      };
      
      let endpoint = "";
      if (user.role === 'agency') {
        endpoint = `/api/agencies/${profile._id}`;
      } 
      else if (user.role === 'agent') {
        endpoint = `/api/agents/${profile._id}`;
      } 
      else if (user.role === 'promoter') {
        endpoint = `/api/promoters/${profile._id}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "PUT",
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
      
      // Update user avatar if agent
      if (user.role === 'agent' && photoUrl) {
        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatarUrl: photoUrl }),
        });
        const userData = await userRes.json();
        setUser(userData.data);
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

        <Tabs defaultValue="profile">
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
              
              {user.role === 'agent' && profile && (
                <AgentForm 
                  profile={profile}
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
              <h2 className="text-xl font-bold mb-4">Your Listings</h2>
              <Button onClick={() => navigate("/properties/add")}>Add New Property</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

// Agency Form Component
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

// Agent Form Component
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
          
        // Inside AgentForm component
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

// Promoter Form Component
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