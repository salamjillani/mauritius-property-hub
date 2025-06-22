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
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import mauritiusDistricts from "@/data/mauritiusDistricts.json";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const getAvailableDistricts = () => {
  return mauritiusDistricts.features
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

const MapController = ({
  selectedDistrict,
  setMarkerPosition,
  setFormData,
}) => {
  const map = useMap();
  const geoJsonLayerRef = useRef(null);

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

    if (selectedDistrict) {
      const geoJsonData = getGeoJsonForDistrict(selectedDistrict);
      if (geoJsonData) {
        const geoJsonLayer = L.geoJSON(geoJsonData, {
          style: () => ({
            color: "#4f46e5",
            weight: 2,
            fillOpacity: 0.1,
            fillColor: "#4f46e5",
          }),
        });

        geoJsonLayer.addTo(map);
        geoJsonLayerRef.current = geoJsonLayer;
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
      }
    }

    return () => {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
    };
  }, [selectedDistrict, map]);

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
      country: "Mauritius", // Set default country
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const availableDistricts = getAvailableDistricts();

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "/marker-icon.png",
      iconRetinaUrl: "/marker-icon-2x.png",
      shadowUrl: "/marker-shadow.png",
    });
  }, []);

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
    if (!selectedDistrict) return;

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        city: selectedDistrict,
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
  }, [selectedDistrict]);

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

    // Validate required fields
    if (!formData.title || !formData.description || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.address.city || !formData.address.latitude || !formData.address.longitude) {
      toast({
        title: "Error",
        description: "Please select a location on the map",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Prepare the payload with proper data types
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

      // Remove empty fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      // Clean up address object
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
                  <div className="mb-4">
                    <Select
                      value={selectedDistrict}
                      onValueChange={setSelectedDistrict}
                    >
                      <SelectTrigger className="py-6 text-base border-slate-200 hover:border-slate-300">
                        <SelectValue placeholder="Select a district/area" />
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
          
                  <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <MapContainer
                      center={[-20.2, 57.5]}
                      zoom={10}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {markerPosition && <Marker position={markerPosition} />}
                      <MapController
                        selectedDistrict={selectedDistrict}
                        setMarkerPosition={setMarkerPosition}
                        setFormData={setFormData}
                      />
                    </MapContainer>
                  </div>
                  <div className="mt-3">
                    <Label
                      htmlFor="address.city"
                      className="text-slate-700 font-medium mb-2 block"
                    >
                      City/District *
                    </Label>
                    <Input
                      id="address.city"
                      name="address.city"
                      placeholder="Grand Baie"
                      value={formData.address.city}
                      onChange={handleChange}
                      required
                      className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label
                        htmlFor="address.latitude"
                        className="text-slate-700 font-medium mb-2 block"
                      >
                        Latitude *
                      </Label>
                      <Input
                        id="address.latitude"
                        name="address.latitude"
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={formData.address.latitude}
                        onChange={handleChange}
                        required
                        className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="address.longitude"
                        className="text-slate-700 font-medium mb-2 block"
                      >
                        Longitude *
                      </Label>
                      <Input
                        id="address.longitude"
                        name="address.longitude"
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={formData.address.longitude}
                        onChange={handleChange}
                        required
                        className="py-6 text-base border-slate-200 hover:border-slate-300 focus:border-blue-500"
                      />
                    </div>
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
            </div>
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
                        setFormData((prev) => ({
                          ...prev,
                          isFeatured: checked === true,
                        }))
                      }
                      className="w-6 h-6 border-2 border-slate-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
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