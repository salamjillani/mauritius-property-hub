import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Square } from "lucide-react";

const PromoterProjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?category=land&status=active`);
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjects(data.data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [toast]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 py-12"
    >
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Upcoming Projects</h2>
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="rounded-2xl overflow-hidden shadow-xl border-0 hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/properties/${project._id}`)}
            >
              <div className="relative">
                <img
                  src={project.images?.[0]?.url || "/placeholder.jpg"}
                  alt={project.title}
                  className="h-64 w-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-800">{project.title}</h3>
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin size={16} />
                  <p className="text-sm">{project.address?.city}, {project.address?.country || 'Mauritius'}</p>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Square size={16} />
                  <span>{project.size} m²</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default PromoterProjects;