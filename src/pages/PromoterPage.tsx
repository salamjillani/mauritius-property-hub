// pages/PromoterPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Home, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";

const PromoterPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoter, setPromoter] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

 useEffect(() => {
  const fetchPromoter = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/promoters/${id}?approvalStatus=approved`
      );
        if (!response.ok) throw new Error("Failed to fetch promoter");
        const data = await response.json();
        setPromoter(data.data);

        const projectsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/projects?promoter=${id}`);
        if (!projectsResponse.ok) throw new Error("Failed to fetch projects");
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.data);
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
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
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
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">Promoter not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <BackButton to="/promoters" label="Back to Promoters" className="mb-10 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-3xl shadow-lg p-8 mb-12 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
            <img
              src={promoter.avatarUrl || "/default-avatar.jpg"}
              alt={`${promoter.firstName} ${promoter.lastName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{promoter.firstName} {promoter.lastName}</h1>
            <p className="text-lg text-blue-100">Property Developer</p>
          </div>
          <div className="flex-1 flex justify-center md:justify-end gap-4">
            <div className="flex items-center gap-2 text-blue-100">
              <Phone size={20} />
              <span>{localStorage.getItem("token") ? promoter.phone || "(555) 123-4567" : "Log in to view"}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Mail size={20} />
              <span>{localStorage.getItem("token") ? promoter.email || "promoter@example.com" : "Log in to view"}</span>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Our Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="relative">
                  <img
                    src={project.images?.[0]?.url || "/placeholder.jpg"}
                    alt={project.title}
                    className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button className="w-full bg-white/90 hover:bg-white text-slate-800 backdrop-blur-sm">
                      <Eye size={16} className="mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
                <div className="p-6 space-y-3 bg-white">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors duration-300 line-clamp-2">
                      {project.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm text-slate-500 capitalize">{project.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={16} />
                    <p className="text-sm">{project.address?.city}, {project.address?.country || "Mauritius"}</p>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                  {project.estimatedCompletion && (
                    <p className="text-sm text-slate-600">
                      Est. Completion: {new Date(project.estimatedCompletion).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
};

export default PromoterPage;