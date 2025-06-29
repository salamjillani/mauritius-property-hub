import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapContainer, TileLayer, Marker, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import mauritiusDistricts from "@/data/mauritiusDistricts.json";
import mauritiusRegions from "@/data/mauritiusRegions.json";
import { motion } from "framer-motion";
import { amenities } from '@/data/amenities';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const getAvailableDistricts = () => {
  return mauritiusDistricts.features
    .map((feature) => feature.properties.name)
    .sort();
};

const getAvailableRegions = () => {
  return mauritiusRegions.features
    .map((feature) => feature.properties.name)
    .sort();
};

const getGeoJsonForDistrict = (districtName: string) => {
  const feature = mauritiusDistricts.features.find(
    (f) => f.properties.name === districtName
  );
  if (!feature) return null;
  return {
    type: "FeatureCollection",
    features: [feature],
  };
};

const getGeoJsonForRegion = (regionName: string) => {
  const feature = mauritiusRegions.features.find(
    (f) => f.properties.name === regionName
  );
  if (!feature) return null;
  return {
    type: "FeatureCollection",
    features: [feature],
  };
};

const getDistrictCenter = (districtName: string) => {
  const feature = mauritiusDistricts.features.find(
    (f) => f.properties.name === districtName
  );
  if (!feature) return null;
  const coordinates = feature.geometry.coordinates[0];
  const lats = coordinates.map((coord) => coord[1]);
  const lngs = coordinates.map((coord) => coord[0]);
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  return [centerLat, centerLng];
};

const getRegionCenter = (regionName: string) => {
  const feature = mauritiusRegions.features.find(
    (f) => f.properties.name === regionName
  );
  if (!feature) return null;
  const coordinates = feature.geometry.coordinates[0];
  const lats = coordinates.map((coord) => coord[1]);
  const lngs = coordinates.map((coord) => coord[0]);
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  return [centerLat, centerLng];
};

const MapController = ({
  selectedDistrict,
  selectedRegion,
  setMarkerPosition,
  setFormData,
}) => {
  const map = useMap();
  const geoJsonLayerRef = useRef(null);
  const labelLayerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          latitude: lat.toString(),
          longitude: lng.toString(),
        },
      }));
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, setMarkerPosition, setFormData]);

  useEffect(() => {
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }
    
    if (labelLayerRef.current) {
      map.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }

    let geoJsonData = null;
    if (selectedDistrict) {
      geoJsonData = getGeoJsonForDistrict(selectedDistrict);
    } else if (selectedRegion) {
      geoJsonData = getGeoJsonForRegion(selectedRegion);
    }

    if (geoJsonData) {
      const geoJsonLayer = L.geoJSON(geoJsonData, {
        style: () => ({
          color: "transparent",
          weight: 0,
          fillOpacity: 0,
        }),
      });

      geoJsonLayer.addTo(map);
      geoJsonLayerRef.current = geoJsonLayer;
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
    } else {
      const regionLabels = L.layerGroup().addTo(map);
      labelLayerRef.current = regionLabels;
      
      const regionCenters = {
        "North": [-20.05, 57.55],
        "West": [-20.35, 57.35],
        "East": [-20.25, 57.75],
        "South": [-20.45, 57.55],
        "Central": [-20.30, 57.50]
      };
      
      Object.entries(regionCenters).forEach(([name, center]) => {
        L.marker(center, {
          icon: L.divIcon({
            className: 'region-label',
            html: `<div class="region-label-text">${name}</div>`,
            iconSize: [100, 40],
            iconAnchor: [50, 20]
          }),
          interactive: false
        }).addTo(regionLabels);
      });
      
      const mauritiusBounds = L.geoJSON(mauritiusRegions).getBounds();
      map.fitBounds(mauritiusBounds, { padding: [20, 20] });
    }

    return () => {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
      if (labelLayerRef.current) {
        map.removeLayer(labelLayerRef.current);
        labelLayerRef.current = null;
      }
    };
  }, [selectedDistrict, selectedRegion, map]);

  return null;
};

const AddProperty = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "MUR",
    category: "for-sale",
    rentalPeriod: "",
    type: "Apartment",
    address: {
      street: "",
      city: "",
      region: "",
      country: "Mauritius",
      zipCode: "",
      latitude: "",
      longitude: "",
    },
    bedrooms: "",
    bathrooms: "",
    area: "",
    amenities: [],
    images: [],
    virtualTourUrl: "",
    isPremium: false,
    isGoldCard: false,
    isFeatured: false,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [user, setUser] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const availableDistricts = getAvailableDistricts();
  const availableRegions = getAvailableRegions();

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "marker-icon.gif",
      iconUrl: "/marker-icon.gif",
      shadowUrl: "/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
  if (formData.isFeatured && user && user.featuredListingsLimit <= 0) {
    setFormData(prev => ({ ...prev, isFeatured: false }));
    toast({
      title: "No Featured Listings Available",
      description: "You have no featured listings remaining",
      variant: "destructive",
    });
  }
}, [formData.isFeatured, user]);

  useEffect(() => {
    if (formData.address.latitude && formData.address.longitude) {
      setMarkerPosition([
        parseFloat(formData.address.latitude),
        parseFloat(formData.address.longitude),
      ]);
    }
  }, []);

  useEffect(() => {
    if (!['for-rent', 'office-rent'].includes(formData.category)) {
      setFormData(prev => ({ ...prev, rentalPeriod: '' }));
    }
  }, [formData.category]);

  useEffect(() => {
    if (selectedDistrict) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          city: selectedDistrict,
          region: "",
        },
      }));

      const districtCenter = getDistrictCenter(selectedDistrict);
      if (districtCenter) {
        setMarkerPosition(districtCenter);
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            latitude: districtCenter[0].toString(),
            longitude: districtCenter[1].toString(),
          },
        }));
      }
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedRegion) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          region: selectedRegion,
          city: "",
        },
      }));

      const regionCenter = getRegionCenter(selectedRegion);
      if (regionCenter) {
        setMarkerPosition(regionCenter);
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            latitude: regionCenter[0].toString(),
            longitude: regionCenter[1].toString(),
          },
        }));
      }
    }
  }, [selectedRegion]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        toast({
          title: "Authentication Required",
          description: "Please log in to add a property.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUser(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user data.",
          variant: "destructive",
        });
      }
    };

    fetchUser();
  }, [navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Error",
        description: "Some files are too large. Maximum size is 5MB per image.",
        variant: "destructive",
      });
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: "Error",
        description: "Please select only JPEG, PNG, or WebP images.",
        variant: "destructive",
      });
      return;
    }

    if (files.length > 10) {
      toast({
        title: "Error",
        description: "You can upload a maximum of 10 images.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(files);

    const imageUrls = files.map((file, index) => ({
      url: URL.createObjectURL(file),
      caption: `Image ${index + 1}`,
      isMain: index === 0,
    }));
    setFormData(prev => ({
      ...prev,
      images: imageUrls,
    }));
  };

  const uploadImagesToCloudinary = async (files) => {
    const uploadedImages = [];
    const token = localStorage.getItem("token");

    try {
      const signatureResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties/cloudinary-signature`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!signatureResponse.ok) {
        const errorData = await signatureResponse.json();
        throw new Error(errorData.message || "Failed to get upload signature");
      }

      const { data: signatureData } = await signatureResponse.json();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey);
        formData.append("timestamp", signatureData.timestamp.toString());
        formData.append("signature", signatureData.signature);
        formData.append("folder", signatureData.folder);

        if (signatureData.uploadPreset) {
          formData.append("upload_preset", signatureData.uploadPreset);
        }

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Failed to upload image ${i + 1}: ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();
        if (uploadResult.error) {
          throw new Error(
            `Cloudinary error for image ${i + 1}: ${uploadResult.error.message}`
          );
        }

        uploadedImages.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          caption: `Image ${i + 1}`,
          isMain: i === 0,
        });
      }

      return uploadedImages;
    } finally {
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "User not loaded",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.isFeatured && user.featuredListingsLimit <= 0) {
  toast({
    title: "Error",
    description: "You have no featured listings remaining",
    variant: "destructive",
  });
  return;
}

    if (
      !formData.address.city && !formData.address.region ||
      !formData.address.latitude ||
      !formData.address.longitude
    ) {
      toast({
        title: "Error",
        description: "Please select a location on the map",
        variant: "destructive",
      });
      return;
    }

    if (!formData.area || isNaN(Number(formData.area))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid area in square meters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        ...formData,
        owner: user._id,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
        area: parseFloat(formData.area),
        address: {
          ...formData.address,
          latitude: parseFloat(formData.address.latitude),
          longitude: parseFloat(formData.address.longitude),
        }
      };

      if (selectedFiles.length > 0) {
        toast({
          title: "Uploading Images",
          description: "Please wait while images are being uploaded...",
        });
        payload.images = await uploadImagesToCloudinary(selectedFiles);
      }

      Object.keys(payload).forEach(key => {
        if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      Object.keys(payload.address).forEach(key => {
        if (payload.address[key] === "" || payload.address[key] === null || payload.address[key] === undefined) {
          delete payload.address[key];
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create property");
      }

      toast({
        title: "Success",
        description: "Property added successfully. It is pending admin approval.",
      });
      if (formData.isFeatured && user) {
  setUser({
    ...user,
    featuredListingsLimit: user.featuredListingsLimit - 1
  });
}
      navigate("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add property",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-gray-900 to-gray-950  bg-clip-text mb-3">
            Add New Property
          </h1>
          <p className="text-slate-600 max-w-md mx-auto">
            List your property and reach thousands of potential buyers
          </p>
        </motion.div>

        {uploadProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 sm:mb-12"
          >
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-700 font-medium">Uploading images...</span>
                <span className="text-slate-700 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}

        {user && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 sm:mb-12 flex flex-wrap justify-center gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-b from-gray-900 to-gray-950  rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-lg">
                  {user.listingLimit === null ? "∞" : user.listingLimit}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Listings Allowed</p>
                <p className="text-lg font-bold text-slate-800">
                  {user.listingLimit === null ? "Unlimited" : user.listingLimit}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-lg">
                  {user.goldCards}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Gold Cards</p>
                <p className="text-lg font-bold text-slate-800">
                  {user.goldCards}
                </p>
              </div>
            </div>

            {user.featuredListingsLimit > 0 && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <div className="text-white font-bold text-lg">
                    {user.featuredListingsLimit}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Featured Listings</p>
                  <p className="text-lg font-bold text-slate-800">
                    {user.featuredListingsLimit}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <motion.form
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              Property Information
            </h2>

            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="title"
                  className="text-slate-700 font-medium mb-2 block"
                >
                  Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Modern Apartment with Sea View"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-slate-700 font-medium mb-2 block"
                >
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your property in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  maxLength={5000}
                  rows={5}
                  className="border-slate-200 hover:border-slate-300 focus:border-blue-500 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="price"
                    className="text-slate-700 font-medium mb-2 block"
                  >
                    Price *
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="currency"
                    className="text-slate-700 font-medium mb-2 block"
                  >
                    Currency
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger
                      id="currency"
                      className="py-6 text-base border-slate-200 hover:border-slate-300"
                    >
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="MUR">MUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="category"
                    className="text-slate-700 font-medium mb-2 block"
                  >
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger
                      id="category"
                      className="py-6 text-base border-slate-200 hover:border-slate-300"
                    >
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="for-sale">For Sale</SelectItem>
                      <SelectItem value="for-rent">For Rent</SelectItem>
                      <SelectItem value="offices">Offices</SelectItem>
                      <SelectItem value="office-rent">Office Rent</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {["for-rent", "office-rent"].includes(formData.category) && (
                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="rentalPeriod"
                      className="text-slate-700 font-medium mb-2 block"
                    >
                      Rental Period
                    </Label>
                    <Select
                      value={formData.rentalPeriod}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          rentalPeriod: value,
                        }))
                      }
                      required
                    >
                      <SelectTrigger className="py-6 text-base border-slate-200 hover:border-slate-300">
                        <SelectValue placeholder="Select rental period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Per Day</SelectItem>
                        <SelectItem value="month">Per Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label
                    htmlFor="type"
                    className="text-slate-700 font-medium mb-2 block"
                  >
                    Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger
                      id="type"
                      className="py-6 text-base border-slate-200 hover:border-slate-300"
                    >
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                      <SelectItem value="Duplex">Duplex</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              Location Details
            </h2>

            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="address.street"
                  className="text-slate-700 font-medium mb-2 block"
                >
                  Street Address
                </Label>
                <Input
                  id="address.street"
                  name="address.street"
                  placeholder="123 Beach Road"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="address.country"
                    className="text-slate-700 font-medium mb-2 block"
                  >
                    Country
                  </Label>
                  <Input
                    id="address.country"
                    name="address.country"
                    placeholder="Mauritius"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="address.zipCode"
                    className="text-slate-700 font-medium mb-2 block"
                  >
                    Zip Code
                  </Label>
                  <Input
                    id="address.zipCode"
                    name="address.zipCode"
                    placeholder="30510"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-slate-700 font-medium mb-2 block">
                    Location on Map *
                  </Label>
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">
                        Select Region
                      </Label>
                      <Select
                        value={selectedRegion}
                        onValueChange={(value) => {
                          setSelectedRegion(value);
                          setSelectedDistrict("");
                        }}
                      >
                        <SelectTrigger className="py-6 text-base border-slate-200 hover:border-slate-300">
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRegions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium mb-2 block">
                        Select District
                      </Label>
                      <Select
                        value={selectedDistrict}
                        onValueChange={(value) => {
                          setSelectedDistrict(value);
                          setSelectedRegion("");
                        }}
                      >
                        <SelectTrigger className="py-6 text-base border-slate-200 hover:border-slate-300">
                          <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
          
        <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
          <style>
            {`
              .region-label-text {
                font-weight: bold;
                font-size: 16px;
                color: #333;
                text-shadow: 
                  1px 1px 0 #fff, 
                  -1px -1px 0 #fff, 
                  -1px 1px 0 #fff, 
                  1px -1px 0 #fff;
                pointer-events: none;
              }
            `}
          </style>
          <MapContainer
            center={[-20.2, 57.5]}
            zoom={10}
            className="h-full w-full relative z-0"
            style={{ zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markerPosition && <Marker position={markerPosition} />}
            <MapController
              selectedDistrict={selectedDistrict}
              selectedRegion={selectedRegion}
              setMarkerPosition={setMarkerPosition}
              setFormData={setFormData}
            />
          </MapContainer>
        </div>
                  <div className="mt-3">
                    {selectedRegion && (
                      <div className="mb-4">
                        <Label
                          htmlFor="address.region"
                          className="text-slate-700 font-medium mb-2 block"
                        >
                          Region *
                        </Label>
                        <Input
                          id="address.region"
                          name="address.region"
                          value={formData.address.region}
                          onChange={handleChange}
                          required
                          className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                        />
                      </div>
                    )}
                    {selectedDistrict && (
                      <div className="mb-4">
                        <Label
                          htmlFor="address.city"
                          className="text-slate-700 font-medium mb-2 block"
                        >
                          District *
                        </Label>
                        <Input
                          id="address.city"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          required
                          className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              Property Details
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <Label
                    htmlFor="bedrooms"
                    className="text-slate-700 font-medium mb-2 block"
                  >
                    Bedrooms
                  </Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    placeholder="3"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="bathrooms"
                    className="text-slate-700 font-medium mb-2 block"
                  >
                    Bathrooms
                  </Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    step="0.5"
                    placeholder="2.5"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="area"
                    className="text-slate-700 font-medium mb-2 block"
                  >
                    Area (m²) *
                  </Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    placeholder="150"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    min="1"
                    className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-slate-700 font-medium mb-2 block">
                  Amenities
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                  {amenities.map((amenity) => (
                    <div key={amenity.name} className="flex items-center gap-3">
                      <Checkbox
                        id={`amenity-${amenity.name}`}
                        checked={formData.amenities.includes(amenity.name)}
                        onCheckedChange={() => handleAmenityChange(amenity.name)}
                        className="w-5 h-5 border-2 border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <Label
                        htmlFor={`amenity-${amenity.name}`}
                        className="text-slate-700 flex items-center gap-2"
                      >
                        <img 
                          src={amenity.icon} 
                          alt={amenity.name} 
                          className="w-6 h-6 object-contain"
                        />
                        {amenity.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              Images
            </h2>
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="images"
                  className="text-slate-700 font-medium mb-2 block"
                >
                  Upload Property Images
                </Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                  className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                />
                <p className="text-sm text-slate-500 mt-2">
                  Max 10 images, 5MB each. Supported formats: JPEG, PNG, WebP.
                </p>
              </div>
              {formData.images.length > 0 && (
                <div>
                  <Label className="text-slate-700 font-medium mb-2 block">
                    Image Previews
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div
                        key={index}
                        className="relative rounded-lg overflow-hidden border border-slate-200"
                      >
                        <img
                          src={img.url}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        {img.isMain && (
                          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
                 <div>
                <Label
                  htmlFor="virtualTourUrl"
                  className="text-slate-700 font-medium mb-2 block"
                >
                  Virtual Tour URL
                </Label>
                <Input
                  id="virtualTourUrl"
                  name="virtualTourUrl"
                  type="url"
                  placeholder="https://example.com/virtual-tour"
                  value={formData.virtualTourUrl}
                  onChange={handleChange}
                  className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                />
              </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              Listing Options
            </h2>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-6">
                {user && user.goldCards > 0 && (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="isGoldCard"
                      checked={formData.isGoldCard}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isGoldCard: checked === true,
                        }))
                      }
                      className="w-6 h-6 border-2 border-slate-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <Label
                      htmlFor="isGoldCard"
                      className="text-slate-700 font-medium"
                    >
                      Use Gold Card (Available: {user.goldCards})
                    </Label>
                  </div>
                )}
               
{user && user.featuredListingsLimit > 0 && (
  <div className="flex items-center gap-3">
    <Checkbox
      id="isFeatured"
      checked={formData.isFeatured}
      onCheckedChange={(checked) => 
        setFormData(prev => ({
          ...prev,
          isFeatured: checked === true,
        }))
      }
      className="w-6 h-6 border-2 border-slate-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
      disabled={user.featuredListingsLimit <= 0}
    />
    <Label
      htmlFor="isFeatured"
      className="text-slate-700 font-medium"
    >
      Feature this listing (Available: {user.featuredListingsLimit})
    </Label>
  </div>
)}
              </div>
            </div>
          </div>

          <div className="text-center pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="py-7 px-12 text-lg font-bold rounded-full bg-gradient-to-b from-gray-900 to-gray-950 "
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding Property...
                </div>
              ) : (
                "Publish Listing"
              )}
            </Button>
          </div>
        </motion.form>
      </main>
      <Footer />
    </div>
  );
};

export default AddProperty;