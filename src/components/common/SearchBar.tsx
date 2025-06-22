import { useState, useEffect } from "react";

// Mock UI components
const Button = ({ children, onClick, disabled, className }) => (
  <button onClick={onClick} disabled={disabled} className={className}>
    {children}
  </button>
);

const Input = ({ placeholder, value, onChange, onKeyPress, className, type = "text" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    className={className}
  />
);

const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {children}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({ children, className }) => (
  <div className={`${className} cursor-pointer`}>
    {children}
  </div>
);

const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;

const SelectContent = ({ children, className }) => (
  <div className={className}>
    {children}
  </div>
);

const SelectItem = ({ value, children, className }) => (
  <div className={`${className} cursor-pointer`}>
    {children}
  </div>
);

// Icons
const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Home = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const Building = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const Hotel = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const DollarSign = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

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
      case "for-sale": return <Home className="h-5 w-5 text-teal-500" />;
      case "for-rent": return <Building className="h-5 w-5 text-teal-500" />;
      case "offices": return <Building className="h-5 w-5 text-teal-500" />;
      case "land": return <MapPin className="h-5 w-5 text-teal-500" />;
      default: return <Home className="h-5 w-5 text-teal-500" />;
    }
  };

  const getPropertyIcon = () => {
    switch(propertyType) {
      case "apartment": return <Building className="h-5 w-5 text-teal-500" />;
      case "house": return <Home className="h-5 w-5 text-teal-500" />;
      case "villa": return <Hotel className="h-5 w-5 text-teal-500" />;
      case "office": return <Building className="h-5 w-5 text-teal-500" />;
      case "land": return <MapPin className="h-5 w-5 text-teal-500" />;
      default: return <Home className="h-5 w-5 text-teal-500" />;
    }
  };

  // Handle key press for accessibility
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
      
      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-sm opacity-60"></div>
      <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-sm opacity-40"></div>
      
      <div className="relative bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200/50">
        {/* Enhanced Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Find Your Perfect Property
          </h2>
          <p className="text-gray-600 text-sm lg:text-base">Search through thousands of properties in Mauritius</p>
        </div>

        {/* Search Form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-3 xl:gap-4">
          {/* Location Search Field */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative flex items-center bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 px-4 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-400 transition-all duration-300 hover:shadow-md">
              <MapPin className="h-5 w-5 text-teal-500 flex-shrink-0 mr-3" />
              <Input
                placeholder="Location, property name, or keyword..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setErrorMessage("");
                }}
                onKeyPress={handleKeyPress}
                className="flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm lg:text-base"
              />
            </div>
          </div>
          
          {/* Category Select */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl pl-12 pr-8 py-3.5 shadow-sm hover:border-teal-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 text-gray-800 text-sm lg:text-base transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
                <option value="offices">Offices</option>
                <option value="land">Land</option>
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {getCategoryIcon()}
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Property Type Select */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative">
              <select 
                value={propertyType} 
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl pl-12 pr-8 py-3.5 shadow-sm hover:border-teal-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 text-gray-800 text-sm lg:text-base transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="office">Office</option>
                <option value="land">Land</option>
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {getPropertyIcon()}
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Price Input Field */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 px-4 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-400 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Max Price"
                  value={maxPrice}
                  onKeyPress={handleKeyPress}
                  onChange={(e) => {
                    // Allow only numbers
                    const value = e.target.value.replace(/[^\d]/g, '');
                    setMaxPrice(value);
                    setErrorMessage("");
                  }}
                  className="flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm lg:text-base"
                />
              </div>
            </div>
          </div>
          
          {/* Search Button */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur opacity-60 group-hover:opacity-80 transition duration-300"></div>
            <Button 
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="relative w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  <span className="text-sm lg:text-base">Searching...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  <span className="text-sm lg:text-base font-medium">Search</span>
                </div>
              )}
            </Button>
          </div>
        </div>
        
        {/* Error message with enhanced styling */}
        {errorMessage && (
          <div className="mt-6 relative">
            <div className="absolute inset-0 bg-red-100 rounded-xl blur-sm"></div>
            <div className="relative p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 text-red-700 rounded-xl shadow-sm backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm lg:text-base">{errorMessage}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchBar;