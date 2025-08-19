import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Filter, X, Home, Bed, Bath, Square, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchParams {
  q?: string;
  category?: string;
  type?: string;
  maxPrice?: string;
  minBeds?: string;
  minBaths?: string;
  minArea?: string;
  amenities?: string;
  location?: string;
}

interface Filters {
  category: string;
  type: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  minArea: string;
  amenities: string[];
  location: string;
}

interface PropertySearchBarProps {
  onSearch?: (params: SearchParams) => Promise<void> | void;
  onFiltersChange?: (params: SearchParams) => void;
  initialFilters?: Partial<Filters & { q: string }>;
  autoNavigate?: boolean; // New prop to control navigation
}

const PropertySearchBar: React.FC<PropertySearchBarProps> = ({ 
  onSearch, 
  onFiltersChange, 
  initialFilters = {},
  autoNavigate = true 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters.q || "");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    category: initialFilters.category || "",
    type: initialFilters.type || "all",
    maxPrice: initialFilters.maxPrice || "",
    minBeds: initialFilters.minBeds || "",
    minBaths: initialFilters.minBaths || "",
    minArea: initialFilters.minArea || "",
    amenities: initialFilters.amenities || [],
    location: initialFilters.location || ""
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const propertyCategories = [
    { value: "", label: "All Categories" },
    { value: "for-sale", label: "For Sale" },
    { value: "for-rent", label: "For Rent" },
    { value: "offices", label: "Offices" },
    { value: "office-rent", label: "Office Rent" },
    { value: "land", label: "Land" }
  ];

  const propertyTypes = [
    { value: "all", label: "All Types" },
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "villa", label: "Villa" },
    { value: "penthouse", label: "Penthouse" },
    { value: "duplex", label: "Duplex" },
    { value: "land", label: "Land" },
    { value: "office", label: "Office" },
    { value: "commercial", label: "Commercial" },
    { value: "other", label: "Other" }
  ];

  const commonAmenities = [
    "Swimming Pool", "Garden", "Parking", "Security", "Air Conditioning",
    "Balcony", "Terrace", "Gym", "Sea View", "Mountain View"
  ];

  // Handle search submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSearching(true);
    
    const searchParams: SearchParams = {
      q: searchQuery.trim(),
      ...filters,
      amenities: filters.amenities.join(",")
    };

    // Remove empty values
    Object.keys(searchParams).forEach(key => {
      const value = searchParams[key as keyof SearchParams];
      if (value === "" || value === "all" || 
          (Array.isArray(value) && value.length === 0)) {
        delete searchParams[key as keyof SearchParams];
      }
    });

    try {
      // If autoNavigate is true and we're not on the properties page, navigate there
      if (autoNavigate && !location.pathname.includes('/properties')) {
        const queryString = new URLSearchParams(searchParams as Record<string, string>).toString();
        navigate(`/properties?${queryString}`);
        return;
      }

      // Otherwise, use the provided callbacks
      if (onSearch) {
        await onSearch(searchParams);
      }
      if (onFiltersChange) {
        onFiltersChange(searchParams);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle amenity toggle
  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: "",
      type: "all",
      maxPrice: "",
      minBeds: "",
      minBaths: "",
      minArea: "",
      amenities: [],
      location: ""
    });
    setSearchQuery("");
  };

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== "" && value !== "all";
  }).length + (searchQuery.trim() ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto relative">
      {/* Main Search Bar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="flex items-center px-6 py-4">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by location, property type, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-lg outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* Quick Category Selector */}
          <div className="hidden md:flex items-center px-4 border-l border-gray-200">
            <Home className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="outline-none text-sm font-medium text-gray-700 bg-transparent"
            >
              {propertyCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center px-4 border-l border-gray-200">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                showFilters || activeFiltersCount > 0
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Button */}
          <div className="px-4">
            <Button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div ref={filtersRef} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Property Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Max Price (MUR)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 5000000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Min Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Min Bedrooms
                </label>
                <select
                  value={filters.minBeds}
                  onChange={(e) => handleFilterChange("minBeds", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num.toString()}>{num}+</option>
                  ))}
                </select>
              </div>

              {/* Min Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Bath className="h-4 w-4" />
                  Min Bathrooms
                </label>
                <select
                  value={filters.minBaths}
                  onChange={(e) => handleFilterChange("minBaths", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num.toString()}>{num}+</option>
                  ))}
                </select>
              </div>

              {/* Min Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Min Area (sq m)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 100"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange("minArea", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, Area..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Category (Mobile) */}
              <div className="md:hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {propertyCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {commonAmenities.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.amenities.includes(amenity)
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(false)}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-2"
              >
                {isSearching ? "Searching..." : "Apply Filters"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySearchBar;