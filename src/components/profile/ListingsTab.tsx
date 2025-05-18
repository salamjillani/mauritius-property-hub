import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EditIcon, Trash2Icon, PlusIcon, Eye, HomeIcon } from "lucide-react";
import PropertyForm from "./PropertyForm";

interface ListingTabProps {
  userId: string;
}

const ListingsTab = ({ userId }: ListingTabProps) => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?owner=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      setListings(data.data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchListings();
    }
  }, [userId]);

  const handleCreateProperty = () => {
    setEditingProperty(null);
    setDialogOpen(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setDialogOpen(true);
  };

  const handleDeleteProperty = (property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      // Log the URL and propertyToDelete for debugging
      console.log(`Deleting property: ${propertyToDelete._id}`);
      console.log(`API URL: ${import.meta.env.VITE_API_URL}/api/properties/${propertyToDelete._id}`);

      // Try the deletion with a more robust approach
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties/${propertyToDelete._id}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      // Log the response status for debugging
      console.log(`Delete response status: ${response.status}`);
      
      // For 500 errors, let's try to get the full response text
      if (response.status === 500) {
        const errorText = await response.text();
        console.log("Server error details:", errorText);
        
        // Check if the error is related to Mongoose/MongoDB
        if (errorText.includes("remove") || errorText.includes("deprecated")) {
          console.log("Detected potential deprecated method issue");
        }
      }

      if (!response.ok) {
        let errorMessage = "Failed to delete property";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server error (${response.status})`;
        } catch (jsonError) {
          errorMessage = `Server error (${response.status}). Check console for details.`;
        }
        
        throw new Error(errorMessage);
      }

      toast({ 
        title: "Success", 
        description: "Property deleted successfully" 
      });
      
      // Refresh the listings after successful deletion
      fetchListings();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const formatPrice = (price: number, currency: string = "MUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Active</Badge>;
      case "pending":
        return <Badge className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-medium">Pending</Badge>;
      case "sold":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-medium">Sold</Badge>;
      case "rented":
        return <Badge className="bg-purple-500 hover:bg-purple-600 text-white font-medium">Rented</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleFormSubmit = async () => {
    // Close the dialog and refresh listings
    setDialogOpen(false);
    fetchListings();
  };

  const viewProperty = (id: string) => {
    // Navigate to property details page
    navigate(`/properties/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <HomeIcon className="h-6 w-6 text-primary/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-lg">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Properties</h2>
          <p className="text-muted-foreground mt-1">Manage your real estate portfolio</p>
        </div>
        <Button 
          onClick={handleCreateProperty} 
          className="bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
          size="lg"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Add New Property
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center p-16 border border-dashed rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <HomeIcon className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">You don't have any properties listed yet. Start building your real estate portfolio today.</p>
          <Button onClick={handleCreateProperty} size="lg" className="bg-primary hover:bg-primary/90 transition-all">
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Your First Property
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableCaption className="pb-4">A comprehensive list of your property portfolio.</TableCaption>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">Title</TableHead>
                <TableHead className="font-semibold text-foreground">Type</TableHead>
                <TableHead className="font-semibold text-foreground">Category</TableHead>
                <TableHead className="font-semibold text-foreground">Price</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((property) => (
                <TableRow key={property._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>{property.category}</TableCell>
                  <TableCell className="font-semibold text-primary">{formatPrice(property.price)}</TableCell>
                  <TableCell>{getStatusBadge(property.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => viewProperty(property._id)}
                        className="hover:bg-primary/10 rounded-full h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditProperty(property)}
                        className="hover:bg-amber-500/10 rounded-full h-8 w-8 p-0"
                      >
                        <EditIcon className="h-4 w-4 text-amber-500" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteProperty(property)}
                        className="hover:bg-red-500/10 rounded-full h-8 w-8 p-0"
                      >
                        <Trash2Icon className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Property Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProperty ? "Edit Property" : "Create New Property"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingProperty
                ? "Update your property details below"
                : "Add information about your new property"}
            </DialogDescription>
          </DialogHeader>
          <PropertyForm 
            property={editingProperty} 
            userId={userId} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center pt-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProperty} className="w-full sm:w-auto">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingsTab;