import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Support = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/support/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(t("Failed to fetch tickets"));
        const data = await response.json();
        setTickets(data.data);
      } catch (error) {
        toast({ title: t("Error"), description: t("failed_to_load_tickets"), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
      };
    fetchTickets();
  }, [toast, t]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/support/tickets/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error(t("Failed to update ticket"));
      const updatedTicket = await response.json();
      setTickets(tickets => tickets.map((ticket) => 
        ticket._id === id ? updatedTicket.data : ticket
      ));
      toast({ title: t("Status Updated"), description: t("Ticket status updated successfully") });
    } catch (error) {
      toast({ title: t("Error"), description: t("failed_to_update_ticket"), variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/support/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(t("Failed to delete ticket"));
      setTickets(tickets => tickets.filter((ticket) => ticket._id !== id));
      toast({ title: t("Ticket Deleted"), description: t("Ticket deleted successfully") });
    } catch (error) {
      toast({ title: t("Error"), description: t(error.message), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">{t("support_tickets")}</h1>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} /> {ticket.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{t("description")}: {ticket.description}</p>
                  <p className="text-sm text-gray-600">{t("user")}: {ticket.user?.firstName} {ticket.user?.lastName} ({ticket.user?.email})</p>
                  <p className="text-sm text-gray-600">{t("status")}: {t(ticket.status)}</p>
                  <div className="mt-2 flex gap-2">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                      className="rounded-md border border-gray-200 px-3 py-2"
                    >
                      <option value="open">{t("open")}</option>
                      <option value="in-progress">{t("in_progress")}</option>
                      <option value="resolved">{t("resolved")}</option>
                      <option value="closed">{t("closed")}</option>
                    </select>
                    <Button variant="destructive" onClick={() => handleDelete(ticket._id)}>
                      {t("delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;