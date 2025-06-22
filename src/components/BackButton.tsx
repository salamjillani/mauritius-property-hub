import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * BackButton Component
 * Provides consistent navigation back to previous pages
 * Can be configured to go to a specific route or use browser history
 */
const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label = 'Back', 
  className = '',
  onClick
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`group relative flex items-center bg-white/70 backdrop-blur-sm hover:bg-white border border-white/30 hover:border-blue-200 text-gray-600 hover:text-blue-600 font-medium px-3 sm:px-4 py-2 h-9 sm:h-10 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-x-1 ${className}`}
      onClick={handleBack}
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative flex items-center space-x-1.5">
        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 transform group-hover:-translate-x-0.5 transition-transform duration-300" />
        <span className="text-xs sm:text-sm font-medium">
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">Back</span>
        </span>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-10 blur-sm transition-opacity duration-300"></div>
    </Button>
  );
};

export default BackButton;