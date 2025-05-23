import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`);
        if (!response.ok) throw new Error("Failed to fetch project");
        const data = await response.json();
        setProject(data.data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load project", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [id, toast]);

  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: project.title,
      text: `Check out this project: ${project.title} in ${project.address?.city}, ${project.address?.country || 'Mauritius'}`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link Copied", description: "Project URL copied to clipboard" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 font-medium">Project not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <BackButton to="/promoters" label="Back to Promoters" className="mb-6" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2">
            <div className="relative mb-6">
              <img
                src={selectedImage || project.images?.[0]?.url || "/placeholder.jpg"}
                alt={project.title}
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4">
                <Button onClick={handleShare} variant="secondary">
                  <Share2 size={20} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {project.images?.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedImage(img.url)}
                />
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{project.title}</h1>
            <p className="text-sm text-slate-500 capitalize mb-4">{project.status}</p>
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <MapPin size={20} />
              <p>{project.address?.city}, {project.address?.country || "Mauritius"}</p>
            </div>
            <p className="text-slate-600 mb-4">{project.description}</p>
            {project.estimatedCompletion && (
              <p className="text-slate-600 mb-4">
                Est. Completion: {new Date(project.estimatedCompletion).toLocaleDateString()}
              </p>
            )}
            {project.amenities?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      <img
                        src={`/amenities/${amenity.toLowerCase().replace(/\s/g, "-")}.webp`}
                        alt={amenity}
                        className="w-6 h-6"
                        onError={(e) => (e.target.src = "/amenities/default.webp")}
                      />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold mb-2">Contact Promoter</h3>
              <div className="flex items-center gap-4">
                <img
                  src={project.promoter?.avatarUrl || "/default-avatar.jpg"}
                  alt={`${project.promoter?.firstName} ${project.promoter?.lastName}`}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="font-bold">{project.promoter?.firstName} {project.promoter?.lastName}</p>
                  <p className="text-sm text-slate-600">Property Developer</p>
                  {localStorage.getItem("token") ? (
                    <>
                      <p className="text-sm text-slate-600">{project.promoter?.phone}</p>
                      <p className="text-sm text-slate-600">{project.promoter?.email}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">Log in to view contact details</p>
                  )}
                </div>
              </div>
            </div>
            {!localStorage.getItem("token") && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Send Inquiry</h3>
                <InquiryForm projectId={id} promoterId={project.promoter?._id} />
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const InquiryForm = ({ projectId, promoterId }) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, projectId, promoterId }),
      });
      if (!response.ok) throw new Error("Failed to submit inquiry");
      toast({ title: "Inquiry Sent", description: "Your inquiry has been sent to the promoter" });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send inquiry", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-200 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-200 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-200 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-200 px-3 py-2"
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Inquiry"}
      </Button>
    </form>
  );
};

export default ProjectDetails;