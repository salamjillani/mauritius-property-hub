// src/components/profile/AgencyProfileForm.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building, Loader2, User } from "lucide-react";

const AgencyProfileForm = ({ agency, onProfileUpdate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    establishedYear: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Mauritius",
    },
    contactDetails: {
      email: "",
      phone: "",
      website: "",
    },
    social: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryWidget, setCloudinaryWidget] = useState(null);
  const [linkedAgents, setLinkedAgents] = useState([]);

  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name || "",
        description: agency.description || "",
        logoUrl: agency.logoUrl || "/default-agency-logo.png",
        establishedYear: agency.establishedYear || "",
        address: {
          street: agency.address?.street || "",
          city: agency.address?.city || "",
          state: agency.address?.state || "",
          zipCode: agency.address?.zipCode || "",
          country: agency.address?.country || "Mauritius",
        },
        contactDetails: {
          email: agency.contactDetails?.email || "",
          phone: agency.contactDetails?.phone || "",
          website: agency.contactDetails?.website || "",
        },
        social: {
          facebook: agency.social?.facebook || "",
          twitter: agency.social?.twitter || "",
          linkedin: agency.social?.linkedin || "",
          instagram: agency.social?.instagram || "",
        },
      });
      setLinkedAgents(agency.agents || []);
    }
  }, [agency]);

  useEffect(() => {
    // Initialize Cloudinary upload widget
    if (window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: "mauritius",
          folder: "agency-logos",
          sources: ["local", "url", "camera"],
          multiple: false,
          resourceType: "image",
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            setFormData((prev) => ({
              ...prev,
              logoUrl: result.info.secure_url,
            }));
            toast({
              title: "Success",
              description: "Logo uploaded successfully",
            });
          } else if (error) {
            toast({
              title: "Error",
              description: "Failed to upload logo",
              variant: "destructive",
            });
          }
        }
      );
      setCloudinaryWidget(widget);
    }
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (name.includes("contactDetails.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contactDetails: { ...prev.contactDetails, [field]: value },
      }));
    } else if (name.includes("social.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        social: { ...prev.social, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agencies/${agency._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update agency profile");
      }
      toast({
        title: "Success",
        description: "Agency profile updated successfully",
      });
      onProfileUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update agency profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCloudinaryWidget = () => {
    if (cloudinaryWidget) {
      cloudinaryWidget.open();
    } else {
      toast({
        title: "Error",
        description: "Cloudinary widget not initialized",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Building size={24} className="text-primary" /> Agency Profile
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Agency Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="establishedYear">Established Year</Label>
            <Input
              id="establishedYear"
              name="establishedYear"
              type="number"
              value={formData.establishedYear}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label>Agency Logo</Label>
          <div className="flex items-center gap-4 mt-1">
            <img
              src={formData.logoUrl}
              alt="Agency Logo"
              className="h-16 w-auto rounded-md object-contain"
              onError={(e) => (e.currentTarget.src = "/default-agency-logo.png")}
            />
            <Button type="button" onClick={openCloudinaryWidget} variant="outline">
              Upload New Logo
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="address.street">Street</Label>
            <Input
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address.city">City</Label>
            <Input
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address.state">State</Label>
            <Input
              id="address.state"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address.zipCode">Zip Code</Label>
            <Input
              id="address.zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="contactDetails.email">Contact Email</Label>
            <Input
              id="contactDetails.email"
              name="contactDetails.email"
              type="email"
              value={formData.contactDetails.email}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contactDetails.phone">Contact Phone</Label>
            <Input
              id="contactDetails.phone"
              name="contactDetails.phone"
              value={formData.contactDetails.phone}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contactDetails.website">Website</Label>
            <Input
              id="contactDetails.website"
              name="contactDetails.website"
              value={formData.contactDetails.website}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="social.facebook">Facebook</Label>
            <Input
              id="social.facebook"
              name="social.facebook"
              value={formData.social.facebook}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="social.twitter">Twitter</Label>
            <Input
              id="social.twitter"
              name="social.twitter"
              value={formData.social.twitter}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="social.linkedin">LinkedIn</Label>
            <Input
              id="social.linkedin"
              name="social.linkedin"
              value={formData.social.linkedin}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="social.instagram">Instagram</Label>
            <Input
              id="social.instagram"
              name="social.instagram"
              value={formData.social.instagram}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Agency Profile"
          )}
        </Button>
      </form>

      {/* Linked Agents Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User size={20} className="text-primary" /> Linked Agents
        </h3>
        {linkedAgents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {linkedAgents.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/agent/${agent._id}`)}
              >
                <img
                  src={agent.photoUrl || "/default-avatar.jpg"}
                  alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                  className="h-12 w-12 rounded-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/default-avatar.jpg")}
                />
                <div>
                  <p className="font-semibold text-slate-800">
                    {agent.user?.firstName} {agent.user?.lastName}
                  </p>
                  <p className="text-sm text-slate-600">{agent.title}</p>
                  <p className="text-sm text-green-600">Status: {agent.approvalStatus}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No agents linked to this agency.</p>
        )}
      </div>
    </div>
  );
};

export default AgencyProfileForm;