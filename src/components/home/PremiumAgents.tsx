import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const PremiumAgents = ({ agents }: { agents: any[] }) => {
  const navigate = useNavigate();

  const handleAgentClick = (id: string) => {
    navigate(`/agent/${id}`);
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="py-12"
    >
      <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
        Meet Our Premium Agents
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {agents.map((agent) => (
          <motion.div
            key={agent._id}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleAgentClick(agent._id)}
            variants={fadeInUp}
          >
            <img
              src={agent.user?.avatarUrl || "default-avatar.jpg"}
              alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800">
                {agent.user?.firstName} {agent.user?.lastName}
              </h3>
              <p className="text-sm text-slate-600">{agent.title}</p>
              <div className="flex items-center gap-1 text-slate-500 mt-2">
                <MapPin size={16} />
                <span className="text-sm">{agent.location || "Mauritius"}</span>
              </div>
              <div className="flex mt-2">
                {[...Array(agent.rating || 4)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
                {[...Array(5 - (agent.rating || 4))].map((_, i) => (
                  <Star key={i} size={16} className="text-slate-200" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PremiumAgents;