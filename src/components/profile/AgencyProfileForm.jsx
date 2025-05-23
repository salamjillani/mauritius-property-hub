import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { uploadAgencyLogoToCloudinary } from "@/utils/cloudinaryService";

const AgencyProfileForm = ({ agency, onProfileUpdate }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name || "",
        description: agency.description || "",
        logoUrl: agency.logoUrl || "",
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
    }
  }, [agency]);

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
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let logoUrl = formData.logoUrl;
      if (logoFile) {
        const result = await uploadAgencyLogoToCloudinary(logoFile, "agency-logos");
        logoUrl = result.url;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/agencies${agency ? `/${agency._id}` : ""}`,
        {
          method: agency ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, logoUrl }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save agency profile");
      }

      toast({
        title: "Success",
        description: "Agency profile saved successfully",
      });

      onProfileUpdate();
    } catch (error) {
      console.error("Error saving agency profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save agency profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Agency Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter agency name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Tell us about your agency..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Agency Logo</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {formData.logoUrl && (
          <img
            src={formData.logoUrl}
            alt="Agency Logo"
            className="mt-2 h-16 w-auto object-contain"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="establishedYear">Established Year</Label>
        <Input
          id="establishedYear"
          name="establishedYear"
          type="number"
          value={formData.establishedYear}
          onChange={handleChange}
          placeholder="e.g., 2005"
        />
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            placeholder="Street Address"
          />
          <Input
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
            placeholder="City"
          />
          <Input
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
            placeholder="State"
          />
          <Input
            name="address.zipCode"
            value={formData.address.zipCode}
            onChange={handleChange}
            placeholder="Zip Code"
          />
          <Input
            name="address.country"
            value={formData.address.country}
            onChange={handleChange}
            placeholder="Country"
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
          "Save Agency Profile"
        )}
      </Button>
    </form>
  );
};

export default AgencyProfileForm;
