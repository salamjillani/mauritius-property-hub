
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";

interface Property {
  _id?: string;
  title: string;
  description: string;
  type: string;
  category: string;
  price: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  address: {
    city: string;
    street?: string;
  };
  featured?: boolean;
  status?: string;
  amenities?: string[];
  images?: Array<{ url: string; caption?: string; isMain?: boolean }>;
}

const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.string().min(1, "Please select a property type"),
  category: z.string().min(1, "Please select a category"),
  price: z.coerce.number().positive("Price must be a positive number"),
  size: z.coerce.number().positive("Size must be a positive number"),
  bedrooms: z.coerce.number().min(0, "Cannot be negative"),
  bathrooms: z.coerce.number().min(0, "Cannot be negative"),
  "address.city": z.string().min(1, "City is required"),
  "address.street": z.string().optional(),
  featured: z.boolean().optional().default(false),
  status: z.string().default("pending"),
  amenities: z.array(z.string()).optional().default([]),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  property: Property | null;
  userId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const PropertyForm = ({ property, userId, onSubmit, onCancel }: PropertyFormProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const { toast } = useToast();

  // Form default values
  const defaultValues = {
    title: property?.title || "",
    description: property?.description || "",
    type: property?.type || "",
    category: property?.category || "",
    price: property?.price || 0,
    size: property?.size || 0,
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    "address.city": property?.address?.city || "",
    "address.street": property?.address?.street || "",
    featured: property?.featured || false,
    status: property?.status || "pending",
    amenities: property?.amenities || [],
  };

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues,
  });

  useEffect(() => {
    // Update form values when property changes
    if (property) {
      form.reset({
        title: property.title,
        description: property.description,
        type: property.type,
        category: property.category,
        price: property.price,
        size: property.size,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        "address.city": property.address.city,
        "address.street": property.address.street || "",
        featured: property.featured,
        status: property.status,
        amenities: property.amenities,
      });
      setAmenities(property.amenities || []);
    } else {
      form.reset(defaultValues);
      setAmenities([]);
    }
  }, [property, form]);

const handleImageUpload = async () => {
  const uploadedUrls = [];
  for (const image of images) {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "your_upload_preset");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    uploadedUrls.push({ url: data.secure_url, isMain: false });
  }
  return uploadedUrls;
};

const handleFormSubmit = async (data: PropertyFormValues) => {
  setIsSubmitting(true);
  
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    // Handle image uploads first
    const uploadedImages = await handleImageUpload();
    
    const formattedData = {
      ...data,
      address: {
        city: data["address.city"],
        street: data["address.street"] || "",
        country: "Mauritius",
      },
      // Include uploaded images in the formatted data
      images: uploadedImages,
      // Mock location data (in a real app, would use geocoding API)
      location: {
        type: "Point",
        coordinates: [-20.348404, 57.552152], // Default to Mauritius
      },
      owner: userId,
    };
    
    let response;
    if (property) {
      // Update existing property
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${property._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });
    } else {
      // Create new property
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });
    }
    
    if (!response.ok) {
      throw new Error("Failed to save property");
    }
    
    toast({
      title: property ? "Property updated" : "Property created",
      description: property
        ? "Your property has been updated successfully"
        : "Your new property has been created successfully",
    });
    
    onSubmit();
  } catch (error) {
    console.error("Error saving property:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to save property",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleAmenityChange = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const commonAmenities = [
    "Air Conditioning",
    "Balcony",
    "Elevator",
    "Furnished",
    "Garden",
    "Gym",
    "Parking",
    "Pool",
    "Security",
    "Wifi",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title*</FormLabel>
                <FormControl>
                  <Input placeholder="Property Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (MUR)*</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Building">Building</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="for-sale">For Sale</SelectItem>
                      <SelectItem value="for-rent">For Rent</SelectItem>
                      <SelectItem value="offices">Offices</SelectItem>
                      <SelectItem value="office-rent">Office Rent</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size (sqm)*</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City*</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your property..." 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
          <FormItem>
  <FormLabel>Images</FormLabel>
  <Input 
    type="file" 
    multiple 
    onChange={(e) => setImages(Array.from(e.target.files || []))}
  />
  <FormMessage />
</FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Featured Property
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Amenities</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {commonAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={amenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityChange(amenity)}
                />
                <label
                  htmlFor={`amenity-${amenity}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

<div className="space-y-2">
  <FormLabel>Upload Images</FormLabel>
  <Input
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => {
      const files = e.target.files;
      if (files) {
        setImages(Array.from(files));
      }
    }}
  />
  {images.length > 0 && (
    <div className="text-sm text-muted-foreground">
      {images.length} files selected
    </div>
  )}
</div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : property
              ? "Update Property"
              : "Create Property"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default PropertyForm;
