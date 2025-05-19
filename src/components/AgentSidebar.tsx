import React, { useEffect, useState } from 'react';
import { X, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export type Agent = {
  id: string;
  name: string;
  role: string;
  photo: string;
  description: string;
  rating: number;
  properties: number;
};

interface AgentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ isOpen, onClose, agents }) => {
  const [api, setApi] = useState<any>(null);
  
  useEffect(() => {
    if (isOpen && api) {
      // Auto-scroll functionality
      const interval = setInterval(() => {
        api.scrollNext();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, api]);

  return (
    <>
      {/* Backdrop overlay when sidebar is open */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-96 bg-gradient-to-b from-white to-slate-50 shadow-2xl z-50 transition-all duration-500 ease-in-out rounded-l-3xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <Building className="h-5 w-5 mr-2 text-primary" />
              <span>Our Agents</span>
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="hover:bg-slate-100 rounded-full h-10 w-10"
            >
              <X className="h-5 w-5 text-slate-600" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          {/* Agents Vertical Carousel */}
          <div className="flex-1 px-6 py-4">
            <Carousel 
              setApi={setApi} 
              className="w-full h-full" 
              opts={{ loop: true, axis: 'y' }} 
              orientation="vertical"
            >
              <CarouselContent className="flex flex-col h-full">
                {agents.map((agent) => (
                  <CarouselItem key={agent.id} className="pt-4 basis-auto min-h-[350px]">
                    <AgentCard agent={agent} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Need assistance with your property journey? Our experts are here to help.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/agent/${agent.id}`);
  };
  
  return (
    <div 
      className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 hover:border-primary/30 group"
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4 mb-4">
        <Avatar className="h-20 w-20 border-2 border-primary/20 ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all duration-300">
          <AvatarImage src={agent.photo} alt={agent.name} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {agent.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg text-slate-800 group-hover:text-primary transition-colors duration-300">{agent.name}</h3>
          <p className="text-sm text-slate-500">{agent.role}</p>
          <div className="flex items-center mt-2">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={cn("w-4 h-4", i < agent.rating ? "text-amber-400" : "text-slate-200")}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-4 italic line-clamp-3">{agent.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-500 flex items-center">
          <Building className="h-4 w-4 mr-1 text-primary/70" />
          {agent.properties} properties
        </span>
        <Button 
          variant="outline" 
          className="h-9 px-4 text-primary border-primary/30 hover:bg-primary/5 hover:border-primary transition-colors duration-300"
        >
          Contact
        </Button>
      </div>
    </div>
  );
};

export default AgentSidebar;