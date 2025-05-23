import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PremiumAgents = ({ agents }) => {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="py-12"
    >
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Our Premium Agents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map((agent) => (
          <motion.div
            key={agent._id}
            className={`group relative bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer ${
              agent.isPremium ? "border-4 border-amber-400 scale-105 animate-pulse" : ""
            }`}
            onClick={() => navigate(`/agent/${agent._id}`)}
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative p-6 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-white shadow-md">
                <img
                  src={agent.user?.avatarUrl || "/default-avatar.jpg"}
                  alt={`${agent.user?.firstName} ${agent.user?.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-lg text-center mb-1">
                {agent.user?.firstName} {agent.user?.lastName}
              </h3>
              <p className="text-sm text-blue-600 font-medium text-center mb-3">{agent.title}</p>
              <div className="flex mb-3">
                {Array.from({ length: agent.rating || 4 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                {Array.from({ length: 5 - (agent.rating || 4) }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-slate-200" />
                ))}
              </div>
              <p className="text-sm text-slate-500">{agent.listingsCount || 0} Listings</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PremiumAgents;