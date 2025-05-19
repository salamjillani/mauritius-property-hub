import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Home, Building, Hotel, DollarSign } from "lucide-react";

// Define types for better type safety
type PropertyType = "all" | "apartment" | "house" | "villa" | "office" | "land";
type CategoryType = "for-sale" | "for-rent" | "offices" | "land";

const SearchBar = () => {
  const [propertyType, setPropertyType] = useState<PropertyType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<CategoryType>("for-sale");
  const [maxPrice, setMaxPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Format price for display
  const formatPrice = (price: number) => {
    return `MUR ${Number(price).toLocaleString()}`;
  };

  useEffect(() => {
    // Reset max price when category changes to avoid confusion
    setMaxPrice("");
    // Clear any error messages when changing parameters
    setErrorMessage("");
  }, [category]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    // Build the search query
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("q", searchTerm);
    if (propertyType !== "all") queryParams.set("type", propertyType);
    if (maxPrice && !isNaN(Number(maxPrice))) queryParams.set("maxPrice", maxPrice);
    
    try {
      // Check if property exists before navigating
      // Make sure API calls use the correct base URL
      const baseUrl = import.meta.env?.VITE_API_URL || '';
      const apiUrl = `${baseUrl}/api/properties/search?category=${category}&${queryParams.toString()}`;
      console.log("Sending request to:", apiUrl);
      
      // Set request options with proper headers
      const requestOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      };
      
      const response = await fetch(apiUrl, requestOptions);
      
      // Add logging to check response status
      console.log("Response status:", response.status);
      
      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Unexpected content type:", contentType, "Response:", errorText);
        throw new Error("Server didn't return JSON");
      }
      
      const data = await response.json();
      console.log("Search results:", data);
      
      if (searchTerm && data.count === 0) {
        setErrorMessage(`No properties found matching "${searchTerm}" in the ${category.replace('-', ' ')} category.`);
        setIsLoading(false);
        return;
      }
      
      // Since we're not using react-router-dom, redirect using window location
      const url = `/properties/${category}?${queryParams.toString()}`;
      window.location.href = url;
    } catch (error) {
      console.error("Search error:", error);
      setErrorMessage(`Search failed: ${error.message || "Unknown error"}`);
      setIsLoading(false);
    }
  };

  const getCategoryIcon = () => {
    switch(category) {
      case "for-sale": return <Home className="h-4 w-4 text-teal-500" />;
      case "for-rent": return <Building className="h-4 w-4 text-teal-500" />;
      case "offices": return <Building className="h-4 w-4 text-teal-500" />;
      case "land": return <MapPin className="h-4 w-4 text-teal-500" />;
      default: return <Home className="h-4 w-4 text-teal-500" />;
    }
  };

  const getPropertyIcon = () => {
    switch(propertyType) {
      case "apartment": return <Building className="h-4 w-4 text-teal-500" />;
      case "house": return <Home className="h-4 w-4 text-teal-500" />;
      case "villa": return <Hotel className="h-4 w-4 text-teal-500" />;
      case "office": return <Building className="h-4 w-4 text-teal-500" />;
      case "land": return <MapPin className="h-4 w-4 text-teal-500" />;
      default: return <Home className="h-4 w-4 text-teal-500" />;
    }
  };

  // Handle key press for accessibility
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      {/* Single row layout for all search fields */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-3">
        {/* Location search field */}
        <div className="flex items-center bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 backdrop-blur-sm flex-grow">
          <MapPin className="h-5 w-5 text-teal-500 flex-shrink-0" />
          <Input
            placeholder="Location, property name, or keyword..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setErrorMessage("");
            }}
            onKeyPress={handleKeyPress}
            className="flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-800 placeholder-gray-400"
          />
        </div>
        
        {/* Category select */}
        <div className="relative w-full md:w-40 flex-shrink-0">
          <Select value={category} onValueChange={(value: CategoryType) => setCategory(value)}>
            <SelectTrigger className="w-full bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 shadow-sm hover:border-teal-400 focus:border-teal-500">
              <div className="absolute left-3 top-2.5">
                {getCategoryIcon()}
              </div>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-lg shadow-lg border border-gray-200">
              <SelectItem value="for-sale" className="py-2.5 hover:bg-teal-50">For Sale</SelectItem>
              <SelectItem value="for-rent" className="py-2.5 hover:bg-teal-50">For Rent</SelectItem>
              <SelectItem value="offices" className="py-2.5 hover:bg-teal-50">Offices</SelectItem>
              <SelectItem value="land" className="py-2.5 hover:bg-teal-50">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Property type select */}
        <div className="relative w-full md:w-40 flex-shrink-0">
          <Select value={propertyType} onValueChange={(value: PropertyType) => setPropertyType(value)}>
            <SelectTrigger className="w-full bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 shadow-sm hover:border-teal-400 focus:border-teal-500">
              <div className="absolute left-3 top-2.5">
                {getPropertyIcon()}
              </div>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-lg shadow-lg border border-gray-200">
              <SelectItem value="all" className="py-2.5 hover:bg-teal-50">All Types</SelectItem>
              <SelectItem value="apartment" className="py-2.5 hover:bg-teal-50">Apartment</SelectItem>
              <SelectItem value="house" className="py-2.5 hover:bg-teal-50">House</SelectItem>
              <SelectItem value="villa" className="py-2.5 hover:bg-teal-50">Villa</SelectItem>
              <SelectItem value="office" className="py-2.5 hover:bg-teal-50">Office</SelectItem>
              <SelectItem value="land" className="py-2.5 hover:bg-teal-50">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Price Input Field */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 w-full md:w-48 flex-shrink-0">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
            <Input
              type="text"
              placeholder={`Max Price`}
              value={maxPrice}
              onKeyPress={handleKeyPress}
              onChange={(e) => {
                // Allow only numbers
                const value = e.target.value.replace(/[^\d]/g, '');
                setMaxPrice(value);
                setErrorMessage("");
              }}
              className="flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
        
        {/* Search Button */}
        <Button 
          onClick={() => handleSearch()}
          disabled={isLoading}
          className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center flex-shrink-0"
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
          ) : (
            <Search className="mr-2 h-5 w-5" />
          )}
          Search
        </Button>
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default SearchBar;