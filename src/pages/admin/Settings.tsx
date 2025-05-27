// pages/admin/Settings.tsx
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    listingLimits: [15, 50, 100, 200, 300, 400, 'unlimited'],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddLimit = () => {
    const newLimit = prompt('Enter new listing limit (number or "unlimited")');
    if (newLimit && (newLimit === 'unlimited' || !isNaN(newLimit))) {
      setSettings((prev) => ({
        ...prev,
        listingLimits: [...prev.listingLimits, newLimit],
      }));
      toast({ title: 'Success', description: 'Listing limit added' });
    } else {
      toast({
        title: 'Error',
        description: 'Invalid listing limit',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Listing Limits</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {settings.listingLimits.map((limit, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                {limit}
              </span>
            ))}
          </div>
          <Button onClick={handleAddLimit}>Add New Limit</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;