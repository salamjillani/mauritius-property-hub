// components/home/PremiumAgents.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PremiumAgents = ({ agents }) => {
  const navigate = useNavigate();

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-center mb-6">Our Premium Agents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {agents.map((agent) => (
          <motion.div
            key={agent._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
              agent.isPremium
                ? "border-4 border-amber-400 scale-105 animate-pulse"
                : ""
            }`}
            onClick={() => navigate(`/agent/${agent._id}`)}
          >
            <img
              src={agent.photoUrl || "/default-avatar.jpg"}
              alt={`${agent.user.firstName} ${agent.user.lastName}`}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold">
                {agent.user.firstName} {agent.user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{agent.title}</p>
              {agent.agency && (
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={agent.agency.logoUrl || "/default-agency-logo.png"}
                    alt={agent.agency.name}
                    className="h-6 w-auto"
                  />
                  <p className="text-sm text-gray-600">{agent.agency.name}</p>
                </div>
              )}
            </div>
            {agent.isPremium && (
              <div className="absolute top-2 right-2 bg-amber-400 text-white text-xs px-2 py-1 rounded-full">
                Premium
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PremiumAgents;