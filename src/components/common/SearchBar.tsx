
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const SearchBar = () => {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("for-sale");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build the search query
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("q", searchTerm);
    if (propertyType !== "all") queryParams.set("type", propertyType);
    
    navigate(`/properties/${category}?${queryParams.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Input
              placeholder="Location, property name, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="for-sale">For Sale</SelectItem>
              <SelectItem value="for-rent">For Rent</SelectItem>
              <SelectItem value="offices">Offices</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="col-span-1 md:col-span-4 mt-2">
            <Button type="submit" className="w-full md:w-auto bg-teal-600 hover:bg-teal-700">
              <Search className="mr-2 h-4 w-4" />
              Search Properties
            </Button>
            
            <Button 
              type="button" 
              variant="link" 
              className="ml-4 text-blue-700"
              onClick={() => navigate("/advanced-search")}
            >
              Advanced Search
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
