import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ContactForm = ({ propertyId, agentId }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, propertyId, agentId })
      });
      if (!response.ok) throw new Error("Failed to send inquiry");
      toast({ title: "Success", description: "Your inquiry has been sent" });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send inquiry", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        name="email"
        type="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Input
        name="phone"
        placeholder="Your Phone"
        value={formData.phone}
        onChange={handleChange}
      />
      <Textarea
        name="message"
        placeholder="Your Message"
        value={formData.message}
        onChange={handleChange}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </Button>
    </form>
  );
};

export default ContactForm;