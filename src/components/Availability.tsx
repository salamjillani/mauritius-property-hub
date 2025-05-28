// components/AvailabilityForm.tsx
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'react-calendar';
import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
const AvailabilityForm = ({ propertyId }) => {
  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: '',
    status: 'available',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/availability`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, propertyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add availability');
        }

      toast({ title: 'Success', description: 'Availability added successfully' });
      setFormData({ startDate: '', endDate: '', status: 'available' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add availability',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-bold mb-2">Add availability</h3>
        <label className="block text-sm font-medium text-gray-700">Date range</label>
        <Calendar
          selectRange
          value={[formData.startDate, formData.endDate]}
          onChange={(dates) => setFormData({
            ...formData,
            startDate: Array.isArray(dates) ? dates[0] : dates,
            endDate: Array.isArray(dates) ? dates[1] : dates
          })}
        />
      </div>
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ''} Add Availability
      </Button>
    </form>
  );
};

export default AvailabilityForm;