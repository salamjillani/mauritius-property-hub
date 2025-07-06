import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Home,
  Award,
  TrendingUp,
  Building,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import PropertyCard from "@/components/PropertyCard";
import { useToast } from "@/hooks/use-toast";

const PromoterPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoter, setPromoter] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromoter = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/promoters/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch promoter");
        const data = await response.json();
        setPromoter(data.data);

        // Fetch promoter projects
        const projectsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/promoters/${id}/projects`
        );
        const projectsData = await projectsRes.json();
        setProjects(projectsData.data || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load promoter data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromoter();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!promoter) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">Promoter not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <BackButton
          to="/promoters"
          label="Back to Promoters"
          className="mb-8 sm:mb-10"
        />

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl shadow-xl overflow-hidden mb-8 sm:mb-12"
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                  <img
                    src={promoter.logoUrl || "/default-logo.jpg"}
                    alt={promoter.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold">{promoter.name}</h1>
                <p className="text-blue-200">Property Developer</p>
                {promoter.establishedYear && (
                  <p className="text-blue-100 mt-1">
                    Established in {promoter.establishedYear}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {localStorage.getItem("token") ? (
                  <>
                    {promoter.user?.phone && (
                      <div className="flex items-center gap-2 text-blue-100">
                        <Phone size={20} />
                        <span>{promoter.user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-blue-100">
                      <Mail size={20} />
                      <span>{promoter.user?.email || "Not provided"}</span>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                    <p className="text-blue-100 font-medium">
                      Log in to view contact details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 sm:mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {projects.length}
                </p>
                <p className="text-slate-600">Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {promoter.establishedYear
                    ? new Date().getFullYear() - promoter.establishedYear
                    : "5+"}
                </p>
                <p className="text-slate-600">Established Year</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">10+</p>
                <p className="text-slate-600">Completed Projects</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="projects">
          <TabsList className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200">
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white px-6 py-3 rounded-xl font-medium"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white px-6 py-3 rounded-xl font-medium"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-gray-900 data-[state=active]:to-gray-950 data-[state=active]:text-white px-6 py-3 rounded-xl font-medium"
            >
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Current Projects
              </h2>
              
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <PropertyCard
                      key={project._id}
                      property={project}
                      currency="MUR"
                      onClick={() => navigate(`/properties/${project._id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <Building className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    No projects found
                  </h3>
                  <p className="text-slate-500">
                    This promoter doesn't have any active projects listed yet
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">About Us</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {promoter.description || "No description available"}
              </p>
              
              {promoter.specialties && promoter.specialties.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {promoter.specialties.map((specialty: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Our Values
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">
                        Quality Construction
                      </h4>
                      <p className="text-slate-600">
                        We use only the highest quality materials and construction techniques
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">
                        Innovative Design
                      </h4>
                      <p className="text-slate-600">
                        Creating spaces that blend functionality with aesthetic appeal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Contact Information
              </h2>
              
              <div className="space-y-4 mb-8">
                {promoter.website && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">Website</p>
                      <a
                        href={promoter.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {promoter.website}
                      </a>
                    </div>
                  </div>
                )}
                
                {promoter.facebook && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Facebook className="w-5 h-5 text-blue-800" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">Facebook</p>
                      <a
                        href={promoter.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {promoter.name}
                      </a>
                    </div>
                  </div>
                )}
                
                {promoter.twitter && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Twitter className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">Twitter</p>
                      <a
                        href={promoter.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        @{promoter.name.replace(/\s+/g, '')}
                      </a>
                    </div>
                  </div>
                )}
                
                {promoter.linkedin && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">LinkedIn</p>
                      <a
                        href={promoter.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {promoter.name}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Send a Message
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                  <Button className="bg-gradient-to-b from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 text-white">
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default PromoterPage;