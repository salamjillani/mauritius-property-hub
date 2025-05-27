import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subscriptions");
        }

        const data = await response.json();
        setSubscriptions(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load subscriptions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [toast]);

  const handleUpdateSubscription = async (subscriptionId, updates) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/subscriptions/${subscriptionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }

      const data = await response.json();
      setSubscriptions(
        subscriptions.map((s) => (s._id === subscriptionId ? data.data : s))
      );
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Manage Subscriptions</h1>
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <p className="text-gray-500">No subscriptions available.</p>
          ) : (
            subscriptions.map((subscription) => (
              <Card key={subscription._id}>
                <CardHeader>
                  <CardTitle>
                    {subscription.user?.email} - {subscription.plan}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Plan</label>
                      <Select
                        defaultValue={subscription.plan}
                        onValueChange={(value) =>
                          handleUpdateSubscription(subscription._id, { plan: value })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Listing Limit</label>
                      <Input
                        type="number"
                        defaultValue={subscription.listingLimit}
                        onBlur={(e) =>
                          handleUpdateSubscription(subscription._id, {
                            listingLimit: parseInt(e.target.value),
                          })
                        }
                        className="w-40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <Select
                        defaultValue={subscription.status}
                        onValueChange={(value) =>
                          handleUpdateSubscription(subscription._id, { status: value })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-gray-500">
                      Listings Used: {subscription.listingsUsed}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSubscriptions;