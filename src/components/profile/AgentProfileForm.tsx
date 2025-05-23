import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { uploadAgentPhotoToCloudinary } from "@/utils/cloudinaryService";
import AgentLinkRequestForm from "./AgentLinkRequestForm";

const AgentProfileForm = ({ agent, onProfileUpdate }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    biography: "",
    specializations: "",
    location: "",
    licenseNumber: "",
    social: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
    },
    contactDetails: {
      email: "",
      phone: "",
      website: "",
    },
    languages: "",
    photoUrl: "",
  });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    if (agent) {
      setFormData({
        title: agent.title || "",
        biography: agent.biography || "",
        specializations: agent.specializations?.join(", ") || "",
        location: agent.location || "",
        licenseNumber: agent.licenseNumber || "",
        social: {
          facebook: agent.social?.facebook || "",
          twitter: agent.social?.twitter || "",
          linkedin: agent.social?.linkedin || "",
          instagram: agent.social?.instagram || "",
        },
        contactDetails: {
          email: agent.contactDetails?.email || "",
          phone: agent.contactDetails?.phone || "",
          website: agent.contactDetails?.website || "",
        },
        languages: agent.languages?.join(", ") || "",
        photoUrl: agent.photoUrl || "",
      });
    }
  }, [agent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let photoUrl = formData.photoUrl;
      if (photoFile) {
        const result = await uploadAgentPhotoToCloudinary(photoFile);
        photoUrl = result.url;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agents${agent ? `/${agent._id}` : ""}`,
        {
          method: agent ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            specializations: formData.specializations.split(",").map((s) => s.trim()),
            languages: formData.languages.split(",").map((l) => l.trim()),
            photoUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save agent profile");
      }

      toast({
        title: "Success",
        description: "Agent profile saved successfully",
      });

      onProfileUpdate();
    } catch (error) {
      console.error("Error saving agent profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save agent profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Real Estate Agent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">Profile Photo</Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {formData.photoUrl && (
            <img
              src={formData.photoUrl}
              alt="Agent Photo"
              className="mt-2 h-16 w-auto object-contain"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="biography">Biography</Label>
          <Textarea
            id="biography"
            name="biography"
            value={formData.biography}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specializations">Specializations (comma-separated)</Label>
          <Input
            id="specializations"
            name="specializations"
            value={formData.specializations}
            onChange={handleChange}
            placeholder="e.g., Residential, Commercial, Luxury"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Grand Baie, Mauritius"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="Enter your license number"
          />
        </div>

        <div className="space-y-2">
          <Label>Social Media</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="social.facebook"
              value={formData.social.facebook}
              onChange={handleChange}
              placeholder="Facebook URL"
            />
            <Input
              name="social.twitter"
              value={formData.social.twitter}
              onChange={handleChange}
              placeholder="Twitter URL"
            />
            <Input
              name="social.linkedin"
              value={formData.social.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn URL"
            />
            <Input
              name="social.instagram"
              value={formData.social.instagram}
              onChange={handleChange}
              placeholder="Instagram URL"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Contact Details</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="contactDetails.email"
              value={formData.contactDetails.email}
              onChange={handleChange}
              placeholder="Contact Email"
            />
            <Input
              name="contactDetails.phone"
              value={formData.contactDetails.phone}
              onChange={handleChange}
              placeholder="Contact Phone"
            />
            <Input
              name="contactDetails.website"
              value={formData.contactDetails.website}
              onChange={handleChange}
              placeholder="Website URL"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            "Save Profile"
          )}
        </Button>
      </form>

      {agent && <AgentLinkRequestForm agent={agent} />}
    </div>
  );
};

export default AgentProfileForm;