import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import UserProfileForm from "@/components/profile/UserProfileForm";
import ListingsTab from "@/components/profile/ListingsTab";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { UserCircle, ListChecks } from "lucide-react";

const Profile = () => {
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [activeCurrency, setActiveCurrency] = useState("MUR");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      toast({
        title: "Authentication required",
        description: "Please log in to access your profile",
        variant: "destructive",
      });
      return;
    }
    
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const userData = await response.json();
        setUser(userData.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar 
          activeLanguage={activeLanguage}
          setActiveLanguage={setActiveLanguage}
          activeCurrency={activeCurrency}
          setActiveCurrency={setActiveCurrency}
        />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-gray-500 font-medium">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar 
        activeLanguage={activeLanguage}
        setActiveLanguage={setActiveLanguage}
        activeCurrency={activeCurrency}
        setActiveCurrency={setActiveCurrency}
      />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8 bg-gradient-to-r from-primary to-primary/80 text-white p-8 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <UserCircle size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user?.firstName ? `${user.firstName}'s Profile` : 'My Profile'}
              </h1>
              <p className="text-white/90 mt-1">
                Manage your account and listings
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Tabs defaultValue="profile" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2 mb-8 rounded-lg bg-gray-100">
                <TabsTrigger 
                  value="profile"
                  className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                >
                  <UserCircle size={18} />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="listings"
                  className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                >
                  <ListChecks size={18} />
                  <span>My Listings</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="profile" className="p-6 pt-0">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <UserProfileForm user={user} />
              </div>
            </TabsContent>
            
            <TabsContent value="listings" className="p-6 pt-0">
              <ListingsTab userId={user?._id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;