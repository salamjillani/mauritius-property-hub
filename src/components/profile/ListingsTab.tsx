
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
import { EditIcon, Trash2Icon, PlusIcon, Eye } from "lucide-react";
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
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/properties/${propertyToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete property");
      }

      toast({
        title: "Property deleted",
        description: "Your property has been successfully deleted",
      });

      // Refresh the listings
      fetchListings();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property",
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
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "sold":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Sold</Badge>;
      case "rented":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Rented</Badge>;
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Properties</h2>
        <Button onClick={handleCreateProperty}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New Property
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">You don't have any properties listed yet.</p>
          <Button onClick={handleCreateProperty}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Your First Property
          </Button>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of your properties.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((property) => (
              <TableRow key={property._id}>
                <TableCell className="font-medium">{property.title}</TableCell>
                <TableCell>{property.type}</TableCell>
                <TableCell>{property.category}</TableCell>
                <TableCell>{formatPrice(property.price)}</TableCell>
                <TableCell>{getStatusBadge(property.status)}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => viewProperty(property._id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditProperty(property)}>
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteProperty(property)}>
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Property Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? "Edit Property" : "Create New Property"}
            </DialogTitle>
            <DialogDescription>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProperty}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingsTab;
