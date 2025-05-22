import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadAgentPhotoToCloudinary } from "@/utils/cloudinaryService"; // Updated import
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AgentProfileForm = ({ agent, onProfileUpdate }: { agent?: any; onProfileUpdate?: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: agent?.title || "",
    biography: agent?.biography || "",
    specializations: agent?.specializations?.join(",") || "",
    location: agent?.location || "",
    licenseNumber: agent?.licenseNumber || "",
    social: {
      facebook: agent?.social?.facebook || "",
      twitter: agent?.social?.twitter || "",
      linkedin: agent?.social?.linkedin || "",
      instagram: agent?.social?.instagram || "",
    },
    contactDetails: {
      email: agent?.contactDetails?.email || "",
      phone: agent?.contactDetails?.phone || "",
      website: agent?.contactDetails?.website || "",
    },
    avatarFile: null as File | null,
  });
  const [previewImage, setPreviewImage] = useState(agent?.user?.avatarUrl || "default-avatar.jpg");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes("social.") || name.includes("contactDetails.")) {
      const [parent, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatarFile: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let avatarUrl = agent?.user?.avatarUrl || "default-avatar.jpg";
      
      // Upload image to Cloudinary if a new file was selected
      if (formData.avatarFile) {
        const uploadedImage = await uploadAgentPhotoToCloudinary(formData.avatarFile); // Updated function call
        avatarUrl = uploadedImage.url;
      }

      const payload = {
        title: formData.title,
        biography: formData.biography,
        specializations: formData.specializations.split(",").map((s) => s.trim()),
        location: formData.location,
        licenseNumber: formData.licenseNumber,
        social: formData.social,
        contactDetails: formData.contactDetails,
        avatarUrl,
      };

      const token = localStorage.getItem("token");
      const response = await fetch(
        agent
          ? `${import.meta.env.VITE_API_URL}/api/agents/${agent._id}`
          : `${import.meta.env.VITE_API_URL}/api/agents`,
        {
          method: agent ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save agent profile");
      }

      toast({
        title: "Success",
        description: agent ? "Profile updated successfully" : "Profile created successfully",
      });

      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="avatar">Profile Picture</Label>
        <div className="flex items-center gap-4">
          <img
            src={previewImage}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <Input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Professional Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Licensed Real Estate Agent"
          required
        />
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
  );
};

export default AgentProfileForm;