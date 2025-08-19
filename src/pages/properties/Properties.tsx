import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertySearchBar from "@/components/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { Home, Tag, Building, MapPin, Sparkles, Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { amenities } from '@/data/amenities';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: string;
  address: {
    street?: string;
    city?: string;
    region?: string;
    country?: string;
  };
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities?: string[];
  images: Array<{
    url: string;
    isMain: boolean;
  }>;
  isFeatured: boolean;
  isGoldCard: boolean;
  isExpired?: boolean;
  createdAt: string;
}

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  // Get search parameters from URL
  const urlSearchQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlType = searchParams.get('type') || '';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlMinBeds = searchParams.get('minBeds') || '';
  const urlMinBaths = searchParams.get('minBaths') || '';
  const urlMinArea = searchParams.get('minArea') || '';
  const urlAmenities = searchParams.get('amenities') || '';
  const urlLocation = searchParams.get('location') || '';
  const regionFilter = searchParams.get('region');

  // Check if any search parameters are present
  const hasSearchParams = urlSearchQuery || urlCategory || urlType || urlMaxPrice || 
    urlMinBeds || urlMinBaths || urlMinArea || urlAmenities || urlLocation;

  // Fetch all properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/properties`
        );
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        
        const sortedProperties = data.data.sort((a: Property, b: Property) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isGoldCard && !b.isGoldCard) return -1;
          if (!a.isGoldCard && b.isGoldCard) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setProperties(sortedProperties);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [toast]);

  // Handle search when URL parameters change
  useEffect(() => {
    if (hasSearchParams) {
      setShowSearchBar(true);
      handleSearchFromURL();
    }
  }, [searchParams, hasSearchParams]);

  // Handle search from URL parameters
  const handleSearchFromURL = async () => {
    setIsSearching(true);
    
    const searchParamsObj: Record<string, string> = {};
    
    if (urlSearchQuery) searchParamsObj.q = urlSearchQuery;
    if (urlCategory) searchParamsObj.category = urlCategory;
    if (urlType && urlType !== 'all') searchParamsObj.type = urlType;
    if (urlMaxPrice) searchParamsObj.maxPrice = urlMaxPrice;
    if (urlMinBeds) searchParamsObj.minBeds = urlMinBeds;
    if (urlMinBaths) searchParamsObj.minBaths = urlMinBaths;
    if (urlMinArea) searchParamsObj.minArea = urlMinArea;
    if (urlAmenities) searchParamsObj.amenities = urlAmenities;
    if (urlLocation) searchParamsObj.location = urlLocation;

    try {
      const queryString = new URLSearchParams(searchParamsObj).toString();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties/search?${queryString}`
      );
      
      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      setSearchResults(data.data || []);
      
      // Update active tab based on category
      if (urlCategory) {
        setActiveTab(urlCategory);
      }
      
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search properties",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle new search from search bar
  const handleSearch = async (params: Record<string, string>) => {
    setIsSearching(true);
    
    try {
      const queryString = new URLSearchParams(params).toString();
      
      // Update URL with search parameters
      setSearchParams(new URLSearchParams(params));
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties/search?${queryString}`
      );
      
      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      setSearchResults(data.data || []);
      setShowSearchBar(true);
      
      // Update active tab based on category
      if (params.category) {
        setActiveTab(params.category);
      }
      
      toast({
        title: "Search Complete",
        description: `Found ${data.count || 0} properties matching your criteria`,
      });
      
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search properties",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search and show all properties
  const clearSearch = () => {
    setSearchParams({});
    setSearchResults([]);
    setShowSearchBar(false);
    setActiveTab("all");
    setSelectedAmenities([]);
  };

  // Determine which properties to show
  const displayProperties = hasSearchParams ? searchResults : properties;

  const filteredProperties = (() => {
    let filtered = activeTab === "all"
      ? displayProperties
      : displayProperties.filter(property => property.category === activeTab);
    
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(property => 
        selectedAmenities.every(amenity => property.amenities?.includes(amenity))
      );
    }

    if (regionFilter) {
      filtered = filtered.filter(property => 
        property.address.region?.toLowerCase() === regionFilter.toLowerCase()
      );
    }

    return filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      if (a.isGoldCard && !b.isGoldCard) return -1;
      if (!a.isGoldCard && b.isGoldCard) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  })();

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "all": return <Home className="h-4 w-4" />;
      case "for-sale": return <Tag className="h-4 w-4" />;
      case "for-rent": return <Building className="h-4 w-4" />;
      case "offices": return <Building className="h-4 w-4" />;
      case "land": return <MapPin className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  const clearAmenitiesFilter = () => setSelectedAmenities([]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex-grow">
          <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-flex items-center justify-center p-3 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg animate-pulse">
                <Home className="h-8 w-8 text-white" />
              </div>
              <div className="h-12 bg-gray-200 rounded-xl w-72 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-150 rounded-lg w-96 mx-auto animate-pulse"></div>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="bg-white/70 backdrop-blur-sm p-2 rounded-2xl shadow-lg">
                <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-150 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-150 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Home className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-gray-900 to-gray-950 bg-clip-text mb-4 leading-tight">
              {hasSearchParams ? "Search Results" : "Properties"}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              {hasSearchParams 
                ? "Properties matching your search criteria" 
                : "Explore our wide range of properties and find your perfect match"
              }
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <div className="h-1 w-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
            </div>
          </motion.div>

          {/* Search Bar - Show when there are search params or toggle button is clicked */}
          {(hasSearchParams || showSearchBar) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <PropertySearchBar
                onSearch={handleSearch}
                autoNavigate={false}
                initialFilters={{
                  q: urlSearchQuery,
                  category: urlCategory,
                  type: urlType,
                  maxPrice: urlMaxPrice,
                  minBeds: urlMinBeds,
                  minBaths: urlMinBaths,
                  minArea: urlMinArea,
                  amenities: urlAmenities ? urlAmenities.split(',') : [],
                  location: urlLocation,
                }}
              />
            </motion.div>
          )}

          {/* Toggle Search Bar Button */}
          {!hasSearchParams && !showSearchBar && (
            <div className="flex justify-center mb-8">
              <Button
                onClick={() => setShowSearchBar(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Advanced Search
              </Button>
            </div>
          )}

          {/* Search Status and Clear Button */}
          {hasSearchParams && (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                {isSearching ? (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    Searching...
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    {filteredProperties.length} results found
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={clearSearch}
                className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear Search
              </Button>
            </div>
          )}

          {regionFilter && (
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Region: {regionFilter}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('region');
                  setSearchParams(params);
                }}
                className="text-red-600 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter by Amenities
                    {selectedAmenities.length > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {selectedAmenities.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-96 overflow-y-auto">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Select Amenities</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose amenities to filter properties
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {amenities.map((amenity) => (
                        <div key={amenity.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${amenity.name}`}
                            checked={selectedAmenities.includes(amenity.name)}
                            onCheckedChange={() => handleAmenityChange(amenity.name)}
                          />
                          <Label htmlFor={`amenity-${amenity.name}`} className="flex items-center gap-2 font-normal">
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
                </PopoverContent>
              </Popover>

              {selectedAmenities.length > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={clearAmenitiesFilter}
                  className="text-red-600 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear Filter
                </Button>
              )}
            </div>

            {selectedAmenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedAmenities.map(amenity => (
                  <span 
                    key={amenity} 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <img 
                      src={amenities.find(a => a.name === amenity)?.icon || ""} 
                      alt={amenity} 
                      className="w-4 h-4"
                    />
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8 lg:mb-12">
              <div className="bg-white/70 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
                <TabsList className="bg-transparent border-0 p-0 h-auto space-x-1">
                  <TabsTrigger 
                    value="all"   
                    className="flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600"
                  >
                    {getTabIcon("all")}
                    <span className="hidden sm:inline">All</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="for-sale"
                   className="flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600"
                  >
                    {getTabIcon("for-sale")}
                    <span className="hidden sm:inline">For Sale</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="for-rent"
                   className="flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600"
                  >
                    {getTabIcon("for-rent")}
                    <span className="hidden sm:inline">For Rent</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="offices"
                    className="flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600"
                  >
                    {getTabIcon("offices")}
                    <span className="hidden sm:inline">Offices</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="land"
                   className="flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600"
                  >
                    {getTabIcon("land")}
                    <span className="hidden sm:inline">Land</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {filteredProperties.length === 0 ? (
                <div className="max-w-lg mx-auto mt-16">
                  <div className="bg-white/70 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-white/20 text-center">
                    <div className="inline-flex items-center justify-center p-4 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full shadow-inner">
                      <Filter className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {hasSearchParams ? "No Results Found" : "No Properties Found"}
                    </h3>
                    <p className="text-gray-500">
                      {hasSearchParams 
                        ? "No properties match your search criteria. Try adjusting your filters or search terms."
                        : "No properties match your current filter. Try selecting a different category or amenity."
                      }
                    </p>
                    {hasSearchParams && (
                      <Button 
                        onClick={clearSearch}
                        className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                      >
                        View All Properties
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                    {filteredProperties.map((property, index) => (
                      <motion.div
                        key={property._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="transform hover:-translate-y-2 transition-transform duration-300"
                      >
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20">
                          <PropertyCard
                            property={property}
                            isExpired={property.isExpired}
                            currency="USD"
                            variant="standard"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-12 text-center">
                    <div className="inline-flex items-center justify-center space-x-8 bg-white/70 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg border border-white/20">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{filteredProperties.length}</div>
                        <div className="text-sm text-gray-600">
                          {hasSearchParams ? "Search Results" : (activeTab === "all" ? "Filtered Properties" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Properties`)}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-gray-300"></div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">{properties.length}</div>
                        <div className="text-sm text-gray-600">Total Properties</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Properties;