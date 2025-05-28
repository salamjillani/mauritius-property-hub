import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/utils/cloudinaryService";

const Verification = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    try {
      const uploadedDocs = await Promise.all(
        Array.from(files).map(async (file) => {
          const result = await uploadToCloudinary(file, "verification-documents");
          return { url: result.url, publicId: result.publicId, type: file.name.includes("id") ? "id" : "ownership" };
        })
      );
      setDocuments(uploadedDocs);
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload documents", variant: "destructive" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ propertyId, documents }),
      });
      if (!response.ok) throw new Error("Failed to submit verification");
      toast({ title: "Verification Submitted", description: "Your documents have been submitted for review" });
      navigate(`/properties/${propertyId}`);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <BackButton to={`/properties/${propertyId}`} label="Back to Property" className="mb-6" />
        <h1 className="text-3xl font-bold mb-6">Property Verification</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Documents (Ownership/ID)</label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Uploaded Documents</h3>
            {documents.length === 0 ? (
              <p className="text-gray-500">No documents uploaded.</p>
            ) : (
              documents.map((doc, index) => (
                <p key={index} className="text-sm text-gray-600">{doc.type}: {doc.url}</p>
              ))
            )}
          </div>
          <Button type="submit" disabled={isSubmitting || documents.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Upload className="mr-2 h-4 w-4" /> Submit Verification</>}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Verification;