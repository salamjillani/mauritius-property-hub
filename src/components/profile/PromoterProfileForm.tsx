import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { uploadPromoterLogoToCloudinary } from "@/utils/cloudinaryService";

const PromoterProfileForm = ({ promoter, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    companyName: promoter?.companyName || "",
    description: promoter?.description || "",
    logoUrl: promoter?.logoUrl || "",
    contactDetails: {
      email: promoter?.contactDetails?.email || "",
      phone: promoter?.contactDetails?.phone || "",
      website: promoter?.contactDetails?.website || ""
    },
    specialties: promoter?.specialties?.join(", ") || "",
    establishedYear: promoter?.establishedYear || "",
    address: {
      street: promoter?.address?.street || "",
      city: promoter?.address?.city || "",
      state: promoter?.address?.state || "",
      zipCode: promoter?.address?.zipCode || "",
      country: promoter?.address?.country || "Mauritius"
    },
    social: {
      facebook: promoter?.social?.facebook || "",
      twitter: promoter?.social?.twitter || "",
      linkedin: promoter?.social?.linkedin || "",
      instagram: promoter?.social?.instagram || ""
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (promoter) {
      setFormData({
        companyName: promoter.companyName || "",
        description: promoter.description || "",
        logoUrl: promoter.logoUrl || "",
        contactDetails: {
          email: promoter.contactDetails?.email || "",
          phone: promoter.contactDetails?.phone || "",
          website: promoter.contactDetails?.website || ""
        },
        specialties: promoter.specialties?.join(", ") || "",
        establishedYear: promoter.establishedYear || "",
        address: {
          street: promoter.address?.street || "",
          city: promoter.address?.city || "",
          state: promoter.address?.state || "",
          zipCode: promoter.address?.zipCode || "",
          country: promoter.address?.country || "Mauritius"
        },
        social: {
          facebook: promoter.social?.facebook || "",
          twitter: promoter.social?.twitter || "",
          linkedin: promoter.social?.linkedin || "",
          instagram: promoter.social?.instagram || ""
        }
      });
    }
  }, [promoter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let logoUrl = formData.logoUrl;
      if (logoFile) {
        const uploaded = await uploadPromoterLogoToCloudinary(logoFile, "promoter-logos");
        logoUrl = uploaded.url;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/promoters${promoter ? `/${promoter._id}` : ""}`,
        {
          method: promoter ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            ...formData,
            logoUrl,
            specialties: formData.specialties.split(",").map((s) => s.trim())
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save promoter profile");
      }

      toast({ title: "Success", description: "Profile updated successfully" });
      onProfileUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Promoter Profile</h2>
      <div className="space-y-4">
        <div>
          <Label>Company Name</Label>
          <Input
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Company Name"
            required
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your company"
            required
          />
        </div>
        <div>
          <Label>Logo</Label>
          <Input type="file" accept="image/*" onChange={handleLogoChange} />
          {formData.logoUrl && <img src={formData.logoUrl} alt="Logo" className="w-32 h-32 mt-2 object-contain" />}
        </div>
        <div>
          <Label>Contact Email</Label>
          <Input
            name="contactDetails.email"
            value={formData.contactDetails.email}
            onChange={handleChange}
            placeholder="Email"
          />
        </div>
        <div>
          <Label>Contact Phone</Label>
          <Input
            name="contactDetails.phone"
            value={formData.contactDetails.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
        </div>
        <div>
          <Label>Website</Label>
          <Input
            name="contactDetails.website"
            value={formData.contactDetails.website}
            onChange={handleChange}
            placeholder="Website"
          />
        </div>
        <div>
          <Label>Specialties (comma-separated)</Label>
          <Input
            name="specialties"
            value={formData.specialties}
            onChange={handleChange}
            placeholder="e.g., Residential, Commercial"
          />
        </div>
        <div>
          <Label>Established Year</Label>
          <Input
            name="establishedYear"
            type="number"
            value={formData.establishedYear}
            onChange={handleChange}
            placeholder="Year"
          />
        </div>
        <div>
          <Label>Address</Label>
          <Input
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            placeholder="Street"
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
        <div>
          <Label>Social Media</Label>
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
};

export default PromoterProfileForm;