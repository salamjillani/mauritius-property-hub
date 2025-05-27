import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Loader2Icon } from "lucide-react";

interface AvailabilityFormProps {
  propertyId: string;
  onSuccess?: (newAvailability: any) => void;
}

const AvailabilityForm = ({ propertyId, onSuccess }: AvailabilityFormProps) => {
  const [formData, setFormData] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: "available",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/availability`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add availability");
      }

      const data = await response.json();
      onSuccess?.(data.data);
      setFormData({ startDate: undefined, endDate: undefined, status: "available" });
      toast({ title: "Success", description: "Availability added successfully" });
    } catch (error) {
      console.error("Error adding availability:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add availability",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date Range</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.startDate && !formData.endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.startDate && formData.endDate ? (
                `${format(formData.startDate, "PPP")} - ${format(formData.endDate, "PPP")}`
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              selected={
                formData.startDate && formData.endDate
                  ? { from: formData.startDate, to: formData.endDate }
                  : undefined
              }
              onSelect={(range) => {
                setFormData({
                  ...formData,
                  startDate: range?.from,
                  endDate: range?.to,
                });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isLoading || !formData.startDate || !formData.endDate}>
        {isLoading ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Availability"
        )}
      </Button>
    </form>
  );
};

export default AvailabilityForm;