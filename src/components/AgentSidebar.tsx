import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AgentSidebar = ({ isOpen, onClose, agents }: { isOpen: boolean; onClose: () => void; agents: any[] }) => {
  const navigate = useNavigate();

  const handleAgentClick = (id: string) => {
    navigate(`/agent/${id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 p-6 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Our Agents</h2>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-800">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {agents.map((agent) => (
              <div
                key={agent._id}
                onClick={() => handleAgentClick(agent._id)}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <img
                  src={agent.user?.avatarUrl || "default-avatar.jpg"}
                  alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {agent.user?.firstName} {agent.user?.lastName}
                  </h3>
                  <p className="text-sm text-slate-600">{agent.title}</p>
                  <div className="flex items-center gap-1 text-slate-500 mt-1">
                    <MapPin size={14} />
                    <span className="text-xs">{agent.location || "Mauritius"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Phone size={14} />
                    <span className="text-xs">{agent.contactDetails?.phone || "(555) 123-4567"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Mail size={14} />
                    <span className="text-xs">{agent.contactDetails?.email || "agent@example.com"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentSidebar;