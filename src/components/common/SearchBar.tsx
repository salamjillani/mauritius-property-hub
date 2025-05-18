import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Home, Building, Hotel } from "lucide-react";

const SearchBar = () => {
  const [propertyType, setPropertyType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("for-sale");

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build the search query
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("q", searchTerm);
    if (propertyType !== "all") queryParams.set("type", propertyType);
    
    // In a real app this would use navigate
    console.log(`/properties/${category}?${queryParams.toString()}`);
    // For demo purposes
    alert(`Searching: /properties/${category}?${queryParams.toString()}`);
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

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      <div className="space-y-4">
        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
          <MapPin className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Location, property name, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus:ring-0 focus:outline-none bg-gray-50 text-gray-800 placeholder-gray-400"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 shadow-sm hover:border-teal-400 focus:border-teal-500">
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
          
          <div className="relative">
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 shadow-sm hover:border-teal-400 focus:border-teal-500">
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
        </div>
        
        <Button 
          onClick={handleSearch}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-6 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center"
        >
          <Search className="mr-2 h-5 w-5" />
          Find Your Dream Property
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;