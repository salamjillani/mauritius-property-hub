// components/home/AgentsSection.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AgentsSection = ({ className, agents }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % agents.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, [agents]);

  return (
    <section className={`py-12 bg-gray-100 ${className}`}>
      <h2 className="text-2xl font-bold text-center mb-6">Meet Our Agents</h2>
      <div className="relative overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ duration: 0.5 }}
        >
          {agents.map((agent) => (
            <div
              key={agent._id}
              className={`flex-shrink-0 w-full px-4 cursor-pointer ${
                agent.isPremium ? "border-4 border-amber-400 animate-pulse" : ""
              }`}
              onClick={() => navigate(`/agent/${agent._id}`)}
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AgentsSection;